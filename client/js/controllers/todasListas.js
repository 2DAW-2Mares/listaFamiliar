// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

angular
  .module('app')
  .controller('todasListasController', ['$scope', 'ListaFamiliar', function($scope, ListaFamiliar) {

    function cargaListas() {
      ListaFamiliar.find()
        .$promise
        .then(function(listas) {
          $scope.listas = listas;
        });
    };

    cargaListas();

    $scope.nuevaLista = function() {
      ListaFamiliar.create({
        nombre: $scope.nuevaLista.nombre
      })
        .$promise
        .then(function() {
          cargaListas();
        });
    };

    $scope.solicitar = function(lista) {
      ListaFamiliar.prototype$solicitar({id: lista.id})
        .$promise
        .then(function() {
        });
    };


  }])
;
