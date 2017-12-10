'use strict';

module.exports = function (app) {
  var Role = app.models.Role;
  var Usuario = app.models.Usuario;

  Role.registerResolver('miembroLista', function (role, context, cb) {
    // Q: Is the current request accessing a Project?
    if (context.modelName !== 'Producto' && context.modelName !== 'Usuario' && context.modelName !== 'ListaFamiliar') {
      // A: No. This role is only for productos: callback with FALSE
      return process.nextTick(() => cb(null, false)
    )
      ;
    }

    //Q: Is the user logged in? (there will be an accessToken with an ID if so)
    var userId = context.accessToken.userId;
    if (!userId) {
      //A: No, user is NOT logged in: callback with FALSE
      return process.nextTick(() => cb(null, false)
    )
      ;
    }

    Usuario.findById(userId, function (err, usuario) {
      if (err) return cb(err);
      // Q: Is the current logged-in user associated with this Project?
      // Step 1: lookup the requested project
      if (!context.modelId) return cb(null, false);
      context.model.findById(context.modelId, function (err, instance) {
        // A: The datastore produced an error! Pass error to callback
        if (err) return cb(err);
        // A: There's no project by this ID! Pass error to callback
        if (!instance) return cb(new Error("Instance not found"));

        if (context.modelName == 'Producto') {
          // Estamos intentando operar con un producto
          // Debemos averiguar si el producto está relacionado con la lista familiar del usuario autenticado
          instance.estaEnLaListaFamiliar(usuario.listaFamiliarId, function(err,estaEnLista){
            return cb(err, estaEnLista);
          })
        } else if (context.modelName == 'Usuario') {
          // Estamos intentando operar con un Usuario
          // De momento, el único ACL de Usuario asociado al rol miembroLista es 'aceptarSolicitud'
          // Por lo que debemos mirar si el solicitante tiene alguna solicitud en la lista del autenticado
          instance.tieneSolicitudEnListaFamiliar(usuario.listaFamiliarId, function(err, tieneSolicitudEnLista){
            return cb(err, tieneSolicitudEnLista);
          })
        } else if (context.modelName == 'ListaFamiliar') {
          // Estamos intentando operar con una ListaFamiliar
          // Por lo que debemos mirar si la lista solicitada es la del autenticado la lista del autenticado
          // TODO hacer que findById lo pueda realizar únicamente los miembros de dicha lista
            return cb(err, usuario.listaFamiliarId === context.modelId);
        }

      });

    });
  });

};
