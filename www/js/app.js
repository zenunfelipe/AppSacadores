app = {
  rest:  "http://186.67.74.115:8085/bodega"
};
var printers = [];

angular.module('andes', ['ionic', 'andes.controllers','ngStorage'])

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


  if (!$localStorage.app) { $localStorage.app = app;  }
  if ($localStorage.sacador) { $rootScope.sacador = $localStorage.sacador; }
  
  $rootScope.viendoDetalle = 0;
  
  $state.go("main.home");

  $rootScope.err = function(msg, cb) {
     var alertPopup = $ionicPopup.alert({
       title: 'Error',
       template: (msg ? msg : 'Error al consultar el servicio. Intente más tarde'),
       buttons: [{
        text: 'Aceptar',
        type: 'button-assertive'
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
     var alertPopup = $ionicPopup.alert({
       title: 'Listo',
       template: (msg ? msg : 'Operación realizada'),
       buttons: [{
        text: 'Aceptar',
        type: 'button-assertive'
        }]
     });

     alertPopup.then(function(res) {
      $("body").removeClass("modal-open");
      alertPopup.close();
     });
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
        type: 'button-assertive',
        onTap: function(e) {
          $("body").removeClass("modal-open");
          callback();
        }
      },
     ]
   });
  };

  $rootScope.forHumans = function  ( seconds ) {
      var levels = [
          [Math.floor(seconds / 31536000), 'años'],
          [Math.floor((seconds % 31536000) / 86400), 'dias'],
          [Math.floor(((seconds % 31536000) % 86400) / 3600), 'hrs'],
          [Math.floor((((seconds % 31536000) % 86400) % 3600) / 60), 'mins'],
          [(((seconds % 31536000) % 86400) % 3600) % 60, 'segs'],
      ];
      var returntext = '';

      for (var i = 0, max = levels.length; i < max; i++) {
          if ( levels[i][0] === 0 ) continue;
          returntext += ' ' + levels[i][0] + ' ' + (levels[i][0] === 1 ? levels[i][1].substr(0, levels[i][1].length-1): levels[i][1]);
      };
      return returntext.trim();
  }

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

.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {

  $ionicConfigProvider.backButton.previousTitleText(false).text('');

  $stateProvider

  .state('main', {
    url: '/main',
    abstract: true,
    templateUrl: 'templates/main.html',
    controller: 'MainCtrl'
  })

  .state('main.home', {
    url: '/home',
    views: {
      'menuContent': {
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl'
      }
    }
  })
  .state('main.detalle', {
    url: '/detalle',
    views: {
      'menuContent': {
        templateUrl: 'templates/detalle.html',
        controller: 'DetalleCtrl'
      }
    },
    params : {
      pedido: null
    }
  })

  //$urlRouterProvider.otherwise('/main/home');
})
.filter('price', [
function() { // should be altered to suit your needs
    return function(input) {
      var ret=(input)?input.toString().trim().replace(",",".").toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."):0;
      return ("$ "+ret);
    };
}]);