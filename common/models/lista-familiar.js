'use strict';

module.exports = function(Listafamiliar) {

	// Asignar como 'owner' de la lista que se va a crear, al usuario que solicita su creación
    Listafamiliar.beforeRemote('create', function (context, listaFamiliar, next) {
        context.args.data.owner = context.req.accessToken.userId;
        next();
    });
  
};
