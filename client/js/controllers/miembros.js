// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

angular
  .module('app')
  .controller('MiembrosController', ['$scope', 'Usuario', 'ListaFamiliar', function($scope, Usuario, ListaFamiliar) {

  function cargaMiembros() {
    Usuario.find()
      .$promise
      .then(function(miembros) {
        ListaFamiliar.findById({id: miembros[0].listaFamiliarId})
          .$promise
          .then(function(listaFamiliar){
            for(var i=0; i < miembros.length; i++)
              miembros[i].esPropietario = miembros[i].id == listaFamiliar.owner;
            $scope.miembros = miembros;
          });
        ListaFamiliar.solicitudes({id: miembros[0].listaFamiliarId})
          .$promise
          .then(function(solicitudes){
            $scope.solicitudes = solicitudes;
          });
      });
  };

  cargaMiembros();

    $scope.invitar = function() {
      ListaFamiliar.invitar({email: $scope.invitar.email});
    };

    $scope.transferirPropiedad = function(miembro) {
      Usuario.prototype$nuevoPropietario({id: miembro.id})
        .$promise
        .then(function(response) {
          cargaMiembros();
        });
    };

    $scope.aceptarSolicitud = function(solicitante) {
      Usuario.prototype$aceptarSolicitud({id: solicitante.id})
        .$promise
        .then(function() {
          cargaMiembros();
        });
    };

    $scope.rechazarSolicitud = function(solicitante) {
      Usuario.prototype$rechazarSolicitud({id: solicitante.id})
        .$promise
        .then(function() {
          cargaMiembros();
        });
    };

  }])
 ;
