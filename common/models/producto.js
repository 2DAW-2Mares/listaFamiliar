'use strict';

module.exports = function(Producto) {

  // La lista siempre se asocia desde el código y nunca se puede enviar desde el cliente
  Producto.beforeRemote('**', function (context, producto, next) {
    if (context.args.data && context.method.name != 'create')
      delete context.args.data.listaFamiliarId;
    next();
  });

  // Asignar la 'listaFamiliar' del usuario que la va a crear
  Producto.beforeRemote('create', function (context, producto, next) {
    var Usuario = Producto.app.models.Usuario;
    Usuario.findById(context.req.accessToken.userId, function(err, usuario){
      if (err) next(err);
      context.args.data.listaFamiliarId = usuario.listaFamiliarId;
      next();
    })
  });

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
  });

  Producto.beforeRemote('find', function (context, producto, next) {
    var userId = context.req.accessToken.userId;
    var Usuario = Producto.app.models.Usuario;

    Usuario.findById(userId, function (err, usuario) {
      // Vamos a añadir o modificar el filtro llamando a una funcion
      if (!context.args.filter) context.args.filter = {};
      context.args.filter.where = Producto.addListaFilter(context.args.filter.where, usuario.listaFamiliarId);
      // Vamos a poner que ya estan comprados los productos
      next();
    });
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

  /**
   * Negar el atributo comprar del producto indicado, es decir, si anteriormente estaba a false se pondrá a true y viceversa
   * @param {object} contexto El objeto del contexto
   * @param {Function(Error, object)} callback
   */

  Producto.prototype.comprado = function(contexto, callback) {
    var productoModificado = this;
    productoModificado.comprar = !productoModificado.comprar;
    productoModificado.save(function (err, producto) {
      if (err) callback(err);
      callback(null, productoModificado);
    });
  };

  Producto.prototype.estaEnLaListaFamiliar = function(listaFamiliarId, callback) {
    // Chequeamos si las listas del producto y del usuario coinciden
    if(this.listaFamiliarId == listaFamiliarId) {
      return callback(null, true);
    } else {
      return callback(null, false);
    }
  };

};
