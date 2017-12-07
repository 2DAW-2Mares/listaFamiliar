'use strict';

module.exports = function(Listafamiliar) {

	// Asignar como 'owner' de la lista que se va a crear, al usuario que solicita su creación
    Listafamiliar.beforeRemote('create', function (context, listaFamiliar, next) {
        context.args.data.owner = context.req.accessToken.userId;
        next();
    });

	// Asignar el id de la lista recién creada, al usuario que la creó
    Listafamiliar.afterRemote('create', function (context, listaFamiliar, next) {
    	listaFamiliar.propietario(function(err, usuario){
    		if(err) next(err);
    		usuario.listaFamiliarId = listaFamiliar.id;
    		usuario.save(function(err, usuario){
    			if(err) next(err);
    			next();
    		})
    	})
    });

	// Eliminar cualquier solicitud anterior del usuario
	Listafamiliar.afterRemote('prototype.solicitar', function(context, listaFamiliar, next) {
		var Usuario = Listafamiliar.app.models.Usuario;
		var userId = context.req.accessToken.userId;
		var async = require('async');

		Usuario.findById(userId, function(err, usuario) {
			if (err) next(err);
			usuario.solicitudes(function(err, solicitudes) {
				if (err) next(err);

				async.each(solicitudes,function(listaSolicitada, cb) {
					if (listaSolicitada.id != listaFamiliar.listaFamiliarId) {
						usuario.solicitudes.remove(listaSolicitada, function(err) {
							if (err) cb(err);
							cb();
						});
					} else {
						cb();
					}
				}, function(err) {
					if (err) next(err);
					next();
				});
			});
		});

	});

	/**
	 * Añade una solicitud, del usuario autenticado, a la lista familiar seleccionada.
	 * @param {object} contexto El objeto del contexto
	 * @param {Function(Error, object)} callback
	 */

	Listafamiliar.prototype.solicitar = function(contexto, callback) {
		var solicitud;
		var listaFamiliar = this;
		var userId = contexto.req.accessToken.userId;
		
		listaFamiliar.solicitudes.add(userId,
			function(err) {
				if(err) callback(err);
				solicitud = {
					listaFamiliarId: listaFamiliar.id,
					usuarioId: userId
				}
				callback(null, solicitud);
			}
		);
	};

	Listafamiliar.prototype.propietarioAlternativo = function(callback) {
		var Usuario = Listafamiliar.app.models.Usuario;
		var listaFamiliar = this;

		// Buscamos a uno de los miembros de la listaFamiliar
		Usuario.findOne({
			where: {
				listaFamiliarId: listaFamiliar.id
			}
		}, function(err, usuario) {
			if (err) callback(err);
			if (usuario) {
				listaFamiliar.updateAttribute('owner', usuario.id, function(err, usuario){
					if(err) callback(err);
					callback(null, usuario);
				});
			} else {
				// Como no existe ningún usuario más en esa lista, la borramos
				// No hemos conseguido poner un propietario alternativo, por lo que borramos la lista
				listaFamiliar.destroy(function(err) {
					if (err) next(err);
					callback(null, null);
				})
			}
		})
	};

  /**
   * Invitar a un usuario por email
   * @param {object} context El objeto de contexto
   * @param {string} email El email del usuario al que se va a invitar
   * @param {Function(Error, string)} callback
   */

  Listafamiliar.invitar = function(context, email, callback) {
    var config = require('../../server/config.local.js');
    var Email = Listafamiliar.app.models.Email;
    var Usuario = Listafamiliar.app.models.Usuario;

    var mensaje = "Email enviado a " + email;

    Usuario.findById(context.req.accessToken.userId, function (err, usuario) {
      var html = '<h3>' + usuario.nombre + ' ' + usuario.apellidos +
        ' te ha invitado a participar en su lista de la compra ' +
        '(listaId: ' + usuario.listaFamiliarId + ') </h3>' +
        'Reg&iacute;strate ' +
        '<a href="http://' + config.host + ':' + config.port + '/explorer"' +
        '>aqu&iacute;</a>';
// TODO crear la página de registro y login y cambiar la dirección del enlace
      var options = {
        type: 'email',
        to: email,
        from: config.email_user,
        subject: 'Apúntate a mi lista.',
        text: 'Descarga la aplicaci&oacute;n m&oacute;l',
        html: html
      };

      Email.send(options, function(err, mail) {
        if (err) callback(err);
        callback(null, mensaje);
      });
    });
  };

};
