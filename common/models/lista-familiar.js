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
};
