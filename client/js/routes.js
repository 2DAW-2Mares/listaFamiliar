angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider


  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'AuthLoginController'
  })

  .state('signup', {
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'SignUpController'
  })

  .state('tabsController.miLista', {
    url: '/miLista',
    views: {
      'tab1': {
        templateUrl: 'templates/miLista.html',
        controller: 'miListaCtrl'
      }
    }
  })

  .state('tabsController.miembros', {
    url: '/miembros',
    views: {
      'tab2': {
        templateUrl: 'templates/miembros.html',
        controller: 'miembrosCtrl'
      }
    }
  })

  .state('tabsController.todasLasListas', {
    url: '/todasListas',
    views: {
      'tab3': {
        templateUrl: 'templates/todasLasListas.html',
        controller: 'todasLasListasCtrl'
      }
    }
  })

  .state('tabsController', {
    url: '/tabs',
    templateUrl: 'templates/tabsController.html',
    abstract:true
  })

$urlRouterProvider.otherwise('/login')


});
