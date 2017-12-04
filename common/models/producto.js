'use strict';

module.exports = function(Producto) {
  Producto.beforeRemote('updateAll', function(context, producto, next) {
    var userId = context.req.accessToken.userId;
    var Usuario = Producto.app.models.Usuario;

    Usuario.findById(userId, function(err, usuario) {
      // Vamos a añadir o modificar el filtro llamando a una funcion
      context.args.where = Producto.addListaFilter(context.args.where, usuario.listaFamiliarId);
      context.res.locals.usuario = usuario;
      // Vamos a poner que ya estan comprados los productos
      next();
    });

    // En esta función se añade o se crea el filtro correspondiente para que los cambios afecten unicamente la lista a la que pertenece
    Producto.addListaFilter = function(filter, listaFamiliarId) {
      if (filter) {
        var filterJSON = filter;
        filterJSON = {
          'and': [{
            'listaFamiliarId': listaFamiliarId,
          }, filterJSON],
        };
        filter = filterJSON;
      } else {
        filter = {
          'listaFamiliarId': listaFamiliarId,
        };
      }
      return filter;
    };
  });

  Producto.afterRemote('updateAll', function(context, producto, next) {
    Producto.find({
      where: {
        listaFamiliarId: context.res.locals.usuario.listaFamiliarId,
      },
    },
      function(err, productos) {
        context.result = productos;
        context.resultType = {
          type : 'array',
          description : 'Los productos de la lista familiar'
        };
        next();
      });
  });
};
