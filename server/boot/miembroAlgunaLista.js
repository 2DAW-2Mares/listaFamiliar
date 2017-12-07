'use strict';

module.exports = function (app) {
  var Role = app.models.Role;
  var Usuario = app.models.Usuario;

  Role.registerResolver('miembroAlgunaLista', function (role, context, cb) {
    // Q: Is the current request accessing a Project?
    if (context.modelName !== 'Producto' && context.modelName !== 'ListaFamiliar') {
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
      usuario.esMiembroDeAlgunaListaFamiliar(function(err,esMiembroAlgunaLista){
        return cb(err, esMiembroAlgunaLista);
      })
    });
  });

};
