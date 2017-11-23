'use strict';

module.exports = function(Usuario) {

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

						// asociar la listaFamiliar del autenticado al solicitante
						usuarioSolicitante.listaFamiliarId = usuarioAutenticado.listaFamiliarId;

						// Guardamos los cambios del usuarioSolicitante
						usuarioSolicitante.save(function(err, usuarioSolicitante) {
							
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

};
