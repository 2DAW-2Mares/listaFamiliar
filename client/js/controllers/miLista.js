// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

angular
  .module('app')
  .controller('MiListaController', ['$scope', 'Producto', function($scope, Producto) {
    $scope.productos = Producto.find({
      filter: {"order": "comprar DESC"}
    });

    $scope.comprado = function(producto) {
      Producto.prototype$comprado({id:    producto.id})
        .$promise
        .then(function(response) {
          $scope.productos = Producto.find({
            filter: {"order": "comprar DESC"}
          });
        });
    };
  }])
 ;
