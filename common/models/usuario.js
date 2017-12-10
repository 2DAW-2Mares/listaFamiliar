'use strict';

module.exports = function(Usuario) {

  // La lista siempre se asocia desde el código y nunca se puede enviar desde el cliente
  Usuario.beforeRemote('**', function (context, usuario, next) {
    if (context.args.data)
      delete context.args.data.listaFamiliarId;
    next();
  });

  Usuario.observe('before save', function(ctx, next) {
    if (ctx.currentInstance) {
		  ctx.hookState.currentListaFamiliar = ctx.currentInstance.listaFamiliarId;
    }
		next();
	});

	Usuario.observe('after save', function(ctx, next) {
		if(ctx.instance && (ctx.instance.listaFamiliarId != ctx.hookState.currentListaFamiliar)) {
			// Comprobamos si el usuario aparece como owner en alguna listaFamiliar
			var ListaFamiliar = Usuario.app.models.ListaFamiliar;
			ListaFamiliar.findOne({where:{owner:ctx.instance.id}}, function(err, listaFamiliar){
				if(err) next(err);
				if(listaFamiliar) {
					// Buscamos a un usuario que sustituya
					listaFamiliar.propietarioAlternativo(function(err, nuevoPropietario){
						if(err) next(err);
						next();
					});
				} else {
					// Como no era el propietario de ninguna lista, podemos continuar
					next();
				}
			});

		} else {
			// Se han guardado los datos del usuario sin modificar el atributo listaFamiliarId, por lo que podemos continuar
			next();
		}

	});

	/**
	 * Le enviamos un identificador de usuario y, si ese usuario tiene alguna solicitud en la lista de la que es miembro el actualmente autenticado, esta solicitud será aprobada.
	 * @param {object} request La petición que ha dado lugar a la ejecución de este método
	 * @param {Function(Error, array)} callback
	 */

	Usuario.prototype.aceptarSolicitud = function(request, callback) {
		var usuariosEnLista = [];

		// Como es un método de instancia, podemos utilizar this. En este caso, guardamos this como usuarioSolicitante.
		var usuarioSolicitante = this;

		// Guardamos el id del usuario autenticado
		var autenticadoId = request.accessToken.userId;

		//¿Cuál es la listaFamiliar asociada al usuario autenticado
		Usuario.findById(autenticadoId, function(err, usuarioAutenticado) {
			if (err) callback(err);

			Usuario.find({
					where: {
						listaFamiliarId: usuarioAutenticado.listaFamiliarId
					}
				},
				function(err, usuariosEnLista) {
					if (err) callback(err);
					// ¿El solicitante ha realizado alguna solicitud a la lista del usuarioAutenticado?
					usuarioSolicitante.solicitudes.findById(usuarioAutenticado.listaFamiliarId, function(err, listaFamiliar) {
						// Si no se encuentra la relación entre el usuario solicitante y la listafamiliar devuelve un error
						if (err) callback(err);

						// asociar la listaFamiliar del autenticado al solicitante, guardando los cambios
						usuarioSolicitante.updateAttribute('listaFamiliarId',usuarioAutenticado.listaFamiliarId, function(err, usuarioSolicitante) {

							// Añadimos al usuario al array de usuarios de la listaFamiliar para devolverlo posteriormente
							usuariosEnLista.push(usuarioSolicitante);

							if (err) callback(err);

							//borramos la solicitud
							usuarioSolicitante.solicitudes.remove(listaFamiliar, function(err) {
								if (err) callback(err);
								callback(null, usuariosEnLista);
							})
						})
					})
				}
			);
		})
	};

	/**
	 * El usuario autenticado rechaza la solicitud de pertenencia a su lista del usuario cuyo id se facilita.
	 * @param {object} request El objeto que contiene la petición del usuario autenticado
	 * @param {Function(Error, array)} callback
	 */

	Usuario.prototype.rechazarSolicitud = function(request, callback) {
		var usuariosEnLista = [];

		// Como es un método de instancia, podemos utilizar this. En este caso, guardamos this como usuarioSolicitante.
		var usuarioSolicitante = this;

		// Guardamos el id del usuario autenticado
		var autenticadoId = request.accessToken.userId;

		//¿Cuál es la listaFamiliar asociada al usuario autenticado
		Usuario.findById(autenticadoId, function(err, usuarioAutenticado) {
			if (err) callback(err);

			Usuario.find({
					where: {
						listaFamiliarId: usuarioAutenticado.listaFamiliarId
					}
				},
				function(err, usuariosEnLista) {
					if (err) callback(err);

					//borramos la solicitud
					usuarioSolicitante.solicitudes.remove(usuarioAutenticado.listaFamiliarId, function(err) {
						if (err) callback(err);
						callback(null, usuariosEnLista);
					})
				}
			);
		})
	};

  Usuario.beforeRemote('find', function(context, usuario, next) {
    var userId = context.req.accessToken.userId;

    Usuario.findById(userId, function(err, usuario) {
      // Vamos a añadir o modificar el filtro llamando a una funcion
      context.args.filter = Usuario.addListaFilter(context.args.filter, usuario.listaFamiliarId);
      context.args.filter.fields = ['id', 'nombre', 'apellidos', 'listaFamiliarId'];
      next();
    });

    // En esta función se añade o se crea el filtro correspondiente para que los cambios afecten unicamente la lista a la que pertenece
    Usuario.addListaFilter = function(filter, listaFamiliarId) {
      if (!filter) filter = {};
      var where = filter.where;
      if (where) {
        var filterJSON = where;
        filterJSON = {
          'and': [{
            'listaFamiliarId': listaFamiliarId,
          }, filterJSON]
        };
        where = filterJSON;
      } else {
        where = {
          'listaFamiliarId': listaFamiliarId,
        };
      }
      filter.where = where;
      return filter;
    };
  });

  /**
   * Transferir la propiedad de la lista del usuario autenticado
   * @param {object} contexto El objeto de contexto
   * @param {Function(Error, object)} callback
   */

  Usuario.prototype.nuevoPropietario = function(context, callback) {
    var ListaFamiliar = Usuario.app.models.ListaFamiliar;
    var nuevoPropietario = this;
    var userId = context.req.accessToken.userId;

    Usuario.findById(userId, function (err, usuario) {
      if (err) callback(err);
      if (usuario.listaFamiliarId == nuevoPropietario.listaFamiliarId) {
        ListaFamiliar.findById(usuario.listaFamiliarId, function (err, listaFamiliar) {
          listaFamiliar.updateAttribute('owner', nuevoPropietario.id, function(err, listaFamiliar){
            callback(err, listaFamiliar);
          });
        });
      }
    });
  };

  Usuario.prototype.tieneSolicitudEnListaFamiliar = function(listaFamiliarId, callback) {
    this.solicitudes.findById(listaFamiliarId, function(err, listaFamiliar) {
      // Si no se encuentra la relación entre el usuario solicitante y la listafamiliar devuelve un error
      return callback(err, listaFamiliar ? true : false);
    })
  }

  Usuario.prototype.esPropietariodelaListaFamiliarDelProducto = function(producto, callback) {
    this.esPropietarioDeLaListaFamiliarPorId(producto.listaFamiliarId, function(err, esPropietario) {
      return callback(err, esPropietario);
    })
  }

  Usuario.prototype.esPropietarioDeLaListaFamiliarDelSolicitante = function(solicitante, callback) {
    var usuario = this;
    solicitante.solicitudes.findById(usuario.listaFamiliarId, function(err, listaFamiliar) {
      // Si no se encuentra la relación entre el usuario solicitante y la listafamiliar devuelve un error
      return callback(err, listaFamiliar && listaFamiliar.owner === usuario.id)
    })
  }

  Usuario.prototype.esPropietarioDeLaListaFamiliarDelOtroUsuario = function(otroUsuario, callback) {
    var ListaFamiliar = Usuario.app.models.ListaFamiliar;
    var usuario = this;

    ListaFamiliar.findById(otroUsuario.listaFamiliarId, function(err, listaFamiliar) {
      // Si no se encuentra la relación entre el usuario solicitante y la listafamiliar devuelve un error
      return callback(err, listaFamiliar && listaFamiliar.owner === usuario.id)
    })
  }

  Usuario.prototype.esPropietarioDeLaListaFamiliarPorId = function(listaFamiliarId, callback) {
    var usuario = this;
    var ListaFamiliar = Usuario.app.models.ListaFamiliar;
    ListaFamiliar.findById(listaFamiliarId, function(err, listaFamiliar){
      return callback(err, listaFamiliar && listaFamiliar.owner === usuario.id)
    });
  }

  Usuario.prototype.esMiembroDeAlgunaListaFamiliar = function(callback) {
    var usuario = this;
    var ListaFamiliar = Usuario.app.models.ListaFamiliar;
    ListaFamiliar.findById(usuario.listaFamiliarId, function(err, listaFamiliar){
      return callback(err, listaFamiliar ? true : false);
    });
  }

};
