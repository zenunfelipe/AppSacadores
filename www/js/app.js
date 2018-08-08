app = {
        restApi:  "http://192.168.200.125:8085/bodega/",
        impID: "",
        impNN: "",
        impSERV: "18F0",
        impCHAR: "2AF1",
        auth: 0,
        store: 0,
        code: '',
        user: '',
        pass: '',
        comercio: '',
        nombre: ''
      };
var printers = [];
var alertPopup; 
angular.module('samsungcot', ['ionic', 'samsungcot.controllers','ngStorage'])

.run(function($ionicPlatform, $rootScope, $ionicHistory, $state, $localStorage, $ionicPopup) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
  $rootScope.statusImpresora = "No conectada";
  $rootScope.err = function(msg, cb) {
     alertPopup = $ionicPopup.alert({
       title: 'Error',
       template: (msg ? msg : 'Error al consultar el servicio. Intente más tarde'),
       buttons: [{
        text: 'Aceptar',
        type: 'button-fn'
        }]
     });

     alertPopup.then(function(res) {
       $("body").removeClass("modal-open");
       if (cb) {
        cb();
       }
     });
  };
  $rootScope.ok = function(msg) {
    
     alertPopup = $ionicPopup.alert({
       title: 'Listo',
       template: (msg ? msg : 'Operación realizada'),
       buttons: [{
        text: 'Aceptar',
        type: 'button-fn'
        }]
     });

     alertPopup.then(function(res) {
      $("body").removeClass("modal-open");
      alertPopup.close();
     });
     
     //alert(msg);
  };
  $rootScope.confirmar = function(msg, callback,no) {
   var confirmPopup = $ionicPopup.confirm({
     title: 'Confirmar',
     template: (msg ? msg : '¿Desea continuar?'),
     buttons: [
      { 
        text: 'No', 
        type: 'button-dark',
        onTap: function(e) { if (no) { $("body").removeClass("modal-open"); no(); } } 
      },
      {
        text: '<b>Aceptar</b>',
        type: 'button-possitive',
        onTap: function(e) {
          $("body").removeClass("modal-open");
          callback();
        }
      },
     ]
   });
  };


  $rootScope.cerrarSession = function() {
    $rootScope.confirmar('Vas a salir de tu cuenta', function() {
      $localStorage.$reset();

      $ionicHistory.nextViewOptions({
        disableBack: true,
        historyRoot: true
      });
      $state.go("login");
    });
  };

})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  }) 

  .state('main', {
    url: '/main',
    abstract: true,
    templateUrl: 'templates/main.html',
    controller: 'MainCtrl'
  })

  .state('col', {
    url: '/col',
    templateUrl: 'templates/col.html',
    controller: 'AndesCtrl',
    params : {
      datos: [],
      pasillo: '',
      lado: '',
      columna: ''
    }
  }) 

  .state('main.home', {
    url: '/home',
    views: {
      'menuContent': {
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl'
      }
    },
    params : {
      reloadPrecios: 0
    }
  })

  .state('main.cotizar', {
    url: '/cotizar',
    views: {
      'menuContent': {
        templateUrl: 'templates/cotizar.html',
        controller: 'CotizarCtrl'
      }
    },
    params : {
      reloadPrecios: 0
    }
  })


  .state('main.add', {
    url: '/add/:search',
    views: {
      'menuContent': {
        templateUrl: 'templates/add.html',
        controller: 'AddCtrl'
      }
    }
  })
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});