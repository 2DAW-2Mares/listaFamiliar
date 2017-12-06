'use strict';

module.exports = function (app) {
  var Role = app.models.Role;
  var Usuario = app.models.Usuario;

  Role.registerResolver('propietarioLista', function (role, context, cb) {
    // Q: Is the current request accessing a Project?
    if (context.modelName !== 'Producto' && context.modelName !== 'Usuario') {
      // A: No. This role is only for productos: callback with FALSE
      return process.nextTick(() => cb(null, false));
    }

    //Q: Is the user logged in? (there will be an accessToken with an ID if so)
    var userId = context.accessToken.userId;
    if (!userId) {
      //A: No, user is NOT logged in: callback with FALSE
      return process.nextTick(() => cb(null, false));
    }

    Usuario.findById(userId, function (err, usuario) {
      if (err) return cb(err);
      // Q: Is the current logged-in user associated with this Project?
      // Step 1: lookup the requested project
      context.model.findById(context.modelId, function (err, instance) {
        // A: The datastore produced an error! Pass error to callback
        if (err) return cb(err);
        // A: There's no project by this ID! Pass error to callback
        if (!instance) return cb(new Error("Instance not found"));

        if (context.modelName == 'Producto') {
          // Estamos intentando operar con un producto
          // Debemos averiguar si el producto está relacionado con la lista familiar del usuario autenticado
          usuario.esPropietariodelaListaFamiliarDelProducto(instance, function(err,esPropietario){
            return cb(err, esPropietario);
          })
        } else if (context.modelName == 'Usuario') {
          // Estamos intentando operar con un Usuario
          // De momento, el único ACL de Usuario asociado al rol propietarioLista es 'rechazarSolicitud'
          // Por lo que debemos mirar si el solicitante tiene alguna solicitud en la lista del autenticado
          if (context.method == 'rechazarSolicitud') {
            usuario.esPropietarioDeLaListaFamiliarDelSolicitante(instance, function (err, esPropietarioLista) {
              return cb(err, esPropietarioLista);
            });
          } else if (context.method == 'nuevoPropietario') {
            usuario.esPropietarioDeLaListaFamiliarDelOtroUsuario(instance, function (err, esPropietarioLista) {
              return cb(err, esPropietarioLista);
            });
          }
        }

      });

    });
  });

};
