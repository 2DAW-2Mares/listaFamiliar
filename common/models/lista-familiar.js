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
  
};
