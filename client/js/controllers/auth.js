// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-getting-started-intermediate
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

angular
  .module('app')
  .controller('AuthLoginController', ['$scope', 'AuthService', '$state',
      function($scope, AuthService, $state) {
    $scope.usuario = {
      email: 'email@iesdosmares.com',
      password: 'alumno'
    };

    $scope.login = function() {
      AuthService.login($scope.usuario.email, $scope.usuario.password)
        .then(function() {

          // return to saved returnTo state before redirection to login
          if ($scope.returnTo && $scope.returnTo.state) {
            $state.go(
              $scope.returnTo.state.name,
              $scope.returnTo.params
            );
            // maintain the inherited rootscope variable returnTo
            // but make the returnTo state of it null,
            // so it can be used again after a new login.
            $scope.returnTo.state  = null;
            $scope.returnTo.params = null;
            return;
          }
          // or go to the default state after login
          $state.go('tabsController.miLista');
        });
    };
  }])
  .controller('AuthLogoutController', ['$scope', 'AuthService', '$state',
      function($scope, AuthService, $state) {
    AuthService.logout()
      .then(function() {
        $state.go('login');
      });
  }])
  .controller('SignUpController', ['$scope', 'AuthService', '$state',
      function($scope, AuthService, $state) {
    $scope.usuario = {
      nombre: 'miNombre',
      apellidos: 'misApellidos',
      email: 'email@iesdosmares.com',
      password: 'alumno'
    };

    $scope.register = function() {
      AuthService.register(
        $scope.usuario.nombre,
        $scope.usuario.apellidos,
        $scope.usuario.email,
        $scope.usuario.password)
        .then(function() {
          $state.transitionTo('login');
        });
    };
  }]);
