app = {
  rest:  "http://192.168.200.125:8085/bodega"
};
var printers = [];
var popupwifi = null;
var WifiWizard2 = null;
angular.module('andes', ['ionic', 'andes.controllers','ngStorage'])

.run(function($ionicPlatform, $rootScope, $ionicHistory, $timeout, $state, $localStorage, $ionicPopup, $ionicLoading) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.cordova) {
      window.cordova.plugins.honeywell.selectDevice('dcs.scanner.imager', () => {
        console.info('dcs.scanner.imager codebar device connected');
        window.cordova.plugins.honeywell.claim(() => { 
          console.info('claim success');
          window.cordova.plugins.honeywell.disableTrigger(() => console.info('trigger disabled'));
          window.cordova.plugins.honeywell.register(function(event) {
            var $body = angular.element(document.body);            // 1
            var $rootScope = $body.injector().get('$rootScope');   // 2b
            $rootScope.$broadcast("scanner", { data: event });
            $rootScope.$apply();           
          }, function(err) { 
            console.log(err); 
          });
        }, (err) => {
          console.info(err);
        });
      }, (err) => { console.info(err); });
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

  $rootScope.showload = function(text) {
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner><br /><span>'+(text ? text : '')+'</span>'
    }).then(function(){
    });
  };
  $rootScope.hideload = function(){
    $ionicLoading.hide().then(function(){
    });
  };


  if (!$localStorage.app) { $localStorage.app = app;  }
  if ($localStorage.sacador) { $rootScope.sacador = $localStorage.sacador; }

  $rootScope.readmode = 0;
  $rootScope.viendoDetalle = 0; 
  $state.go("main.home");

  $rootScope.nowifi = function() { 
    popupwifi = $ionicPopup.alert({
     title: "SIN RED DISPONIBLE",
     template: "INTENTANDO CONECTAR WIFI",
     buttons: {
      text: '<b>OK</b>',
      type: 'button-positive',
      onTap: function(e) { e.preventDefault(); }
     }
    });

  }
  $rootScope.siwifi = function() { 
    var event = new CustomEvent("online", { "detail": "Example" });
    document.dispatchEvent(event);
    try {
      if (typeof popupwifi.close === 'function') { popupwifi.close(); }
    } 
    catch(err) {

    }
  }

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
  $rootScope.ok = function(msg, title, callback, aceptarBtn) {
     var alertPopup = $ionicPopup.alert({
       title: (title ? title : 'Listo'),
       template: (msg ? msg : 'Operación realizada'),
       buttons: [{
        text: (aceptarBtn ? aceptarBtn : 'Aceptar'),
        type: 'button-assertive'
        }]
     });

     alertPopup.then(function(res) {
      $("body").removeClass("modal-open");
      alertPopup.close();
      callback();
     });

     if (callback) {
      return alertPopup;
     }
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

  $rootScope.wifiread = function() {
    if (WifiWizard2) {
       console.log("WifiWizard2 starting");
       WifiWizard2.scan().then(function(networks) {
        var connectTo = "";
        var enables = ["BodegaM","Rebicion","bsupermercado","nortponiente","BodegaI"];
        for (var i=0;i<networks.length;i++) {
          if (networks[i].frequency < 3000 && networks[i].level >= -67 && enables.indexOf(networks[i].SSID) > -1) {
            connectTo = networks[i].SSID;
            break;
          }
        }
        console.log('ConnectTo Result: '+connectTo);
        if (connectTo != "") {
          var x = WifiWizard2.isConnectedToInternet();
          x.then(function(z) {
            if (z == "NOT_CONNECTED_TO_INTERNET") {
              var y = WifiWizard2.connect(connectTo, true, "@ndesbodeg@", "WPA", false);
              y.then(function() {
                console.log("WifiWizard2 connected");
                $rootScope.siwifi();
              }, function() {
                console.log("WifiWizard2.connect ("+connectTo+") fail - wifiread again");
                $rootScope.wifiread();
              });
            }
            else {
              console.log("WifiWizard2 != NOT_CONNECTED_TO_INTERNET ("+z+"), SiWifi is call!");
              $rootScope.siwifi();
            }
          }, function() {
            console.log("WifiWizard2 isConnectedToInternet fail - connecting to "+connectTo);
              var y = WifiWizard2.connect(connectTo, true, "@ndesbodeg@", "WPA", false);
              y.then(function() {
                console.log("WifiWizard2 connected");
                $rootScope.siwifi();
              }, function() {
                console.log("WifiWizard2.connect ("+connectTo+") fail - wifiread again");
                $rootScope.wifiread();
              });
          });
        }
        else {
          console.log("WifiWizard2 connect to nothing! - wifiread again");
          $rootScope.wifiread();
        }
      }, function(x) {
        console.log("WifiWizard2 no scan... wifiread again!");
        $rootScope.wifiread();
      });
    } else {
      console.log('Not ready WifiWizard2, triying in 5 seconds');
      $timeout(function() {
        $rootScope.wifiread();
      }, 5000);
    }
  }
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


document.addEventListener("offline", function() {
  var $body = angular.element(document.body);            // 1
  var $rootScope = $body.injector().get('$rootScope');   // 2b
  $rootScope.nowifi();
  if (window.cordova) { $rootScope.wifiread(); }
  if (window.cordova && $rootScope.viendoDetalle == 1) {
    window.cordova.plugins.honeywell.disableTrigger(() => console.info('trigger disabled'));
  }
  $rootScope.$apply();
}, false);

document.addEventListener("online", function() {
  var $body = angular.element(document.body);            // 1
  var $rootScope = $body.injector().get('$rootScope');   // 2b
  $rootScope.siwifi();
  if (window.cordova && $rootScope.viendoDetalle == 1) {
    window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled'));
  }
  $rootScope.$apply();
}, false);

function fakeScan() {
  var $body = angular.element(document.body);            // 1
  var $rootScope = $body.injector().get('$rootScope');   // 2b
  $rootScope.$broadcast("scanner", { data: {success: true, data: "I0000000010240" } });
  $rootScope.$apply();
}
jQuery.ajaxSetup({
  type: 'POST',
  timeout: 3000,
  error: function(xhr) {
    console.log('AjaxSetup Error');
    var $body = angular.element(document.body);            // 1
    var $rootScope = $body.injector().get('$rootScope');   // 2b
    $rootScope.hideload();
    $rootScope.$apply();   
    var event = new CustomEvent("offline", { "detail": "Example" });
    document.dispatchEvent(event);
  }
});