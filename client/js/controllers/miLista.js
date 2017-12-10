// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

angular
  .module('app')
  .controller('MiListaController', ['$scope', 'Producto', function($scope, Producto) {
    $scope.productos = Producto.find({
      filter: {"order": "comprar DESC"}
    });

    $scope.nuevoProducto = function() {
      Producto
        .create({
          nombre: $scope.nuevoProducto.nombre
        })
        .$promise
        .then(function() {
          $scope.nuevoProducto.nombre = "";
          $scope.productos = Producto.find({
            filter: {"order": "comprar DESC"}
          });
        });
    };

    $scope.comprado = function(producto) {
      Producto.prototype$comprado({id:    producto.id})
        .$promise
        .then(function(response) {
          $scope.productos = Producto.find({
            filter: {"order": "comprar DESC"}
          });
        });
    };

    $scope.todoComprado = function() {
      Producto
        .updateAll(
          {},
          {comprar: false}
          )
        .$promise
        .then(function() {
          $scope.productos = Producto.find({
            filter: {"order": "comprar DESC"}
          });
        });
    };

  }])
 ;
