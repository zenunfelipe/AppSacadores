//
angular.module('andes.controllers', [])


.controller('DetalleCtrl', function($scope, $state, $rootScope, $ionicHistory, $localStorage, $location, $timeout, $ionicLoading, $ionicPopup, $stateParams) {
  $scope.pedido = $stateParams.pedido;
  $scope.detalle = [];
  $scope.itemsPendientes = 0;

  $scope.$on('$ionicView.beforeLeave', function(obj, viewData){
    $rootScope.viendoDetalle = 0;
  }); 
  $scope.$on('$ionicView.afterEnter', function(obj, viewData){
    $rootScope.viendoDetalle = 1;
  }); 


  if (!$scope.pedido && !$scope.pedido.hasOwnProperty("IDOperacion")) {
    $rootScope.err("Pedido no es accesible");
    $ionicHistory.goBack();
  }

  $scope.refreshPedido = function() {
      $scope.showload("obteniendo pedido..."); 
      jQuery.post($localStorage.app.rest+"/sacadores.php?op=getDetalle", { IDOperacion: $scope.pedido.IDOperacion, AnnoProceso: $scope.pedido.AnnoProceso, Correlativo: $scope.pedido.Correlativo }, function(data) {
        $scope.hideload();
        if (data.res == "ERR") {
          $rootScope.err(data.msg);
        }
        else {
          $scope.detalle = data.data;
          $scope.itemsPendientes = 0;
          for (var i = 0; i < $scope.detalle.length; i++) {
            $scope.itemsPendientes += ($scope.detalle[i].Cantidad - data.data[i].CantidadPicking);
          }
        }
      },"json").fail(function() {
        $scope.hideload();
        $rootScope.err("Pedido no es accesible");
        $ionicHistory.goBack();
      });
  }

  $scope.refreshPedido();


})
.controller('HomeCtrl', function($scope, $state, $rootScope, $localStorage, $location, $timeout, $ionicLoading, $ionicPopup) {

  $scope.$on('$ionicView.enter', function(obj, viewData){
    if (viewData.direction == 'back') {
      $scope.refresh(); // force update on back
    }
  });

  $scope.$on('$ionicView.beforeLeave', function(obj, viewData){
    $timeout.cancel($rootScope.reloj);
  }); 

  $scope.detalle = function(o) {
    if (o.Habilitado == 2 || o.Habilitado == 3) {
      $rootScope.pedidos = [];
      $state.go("main.detalle", { pedido: o });
    }
    else if (o.Habilitado == 1) {
      $rootScope.confirmar('¿Desea marcar este pedido como pedido en curso?', function() {
        $scope.showload("Iniciando pedido...");
        jQuery.post($localStorage.app.rest+"/sacadores.php?op=actualizarEstado", {
          AnnoProceso: o.AnnoProceso,
          IDOperacion: o.IDOperacion,
          Correlativo: o.Correlativo,
          IDEtapa: 1,
          IDEstado: 0,
          IDSacador: $rootScope.sacador.IDSacador,
          IDUsuario: $rootScope.sacador.szUsuario
        }, function(data) {
          $rootScope.pedidos = [];
          $scope.hideload();
          $state.go("main.detalle", { pedido: o });
        }).fail(function() {
          $scope.hideload();
          $rootScope.err();
        });
      });
    }
  };

})


.controller('MainCtrl', function($scope, $state, $localStorage, $timeout, $ionicModal, $rootScope, $location, $ionicLoading, $ionicSideMenuDelegate) {

  $ionicSideMenuDelegate.canDragContent(false);

  $rootScope.refreshing = 0;
  $rootScope.segs = 59;
  $rootScope.reloj = null;
  $rootScope.pedidos = [];
  $rootScope.sacadores = [];
  $rootScope.emptyMessage = "";

  // Start controller

  $ionicModal.fromTemplateUrl('templates/config.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modalConfiguracion = modal;
  });


  $scope.showload = function(text) {
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner><br /><span>'+(text ? text : '')+'</span>'
    }).then(function(){
    });
  };
  $scope.hideload = function(){
    $ionicLoading.hide().then(function(){
    });
  };

  $scope.down = function() {

    $rootScope.segs--;
    if ($rootScope.segs > 0) {
      $rootScope.reloj = $timeout(function() {
        $scope.down();
      },1000);
    } else {
      $scope.refresh();    
    }
  }

  $scope.refresh = function(isPullToDown) {
    if ($rootScope.refreshing == 1) {

    } else {
      
      $rootScope.segs = 59;
      $rootScope.refreshing = 1;
      $timeout.cancel($rootScope.reloj);

      if (!isPullToDown) { $scope.showload("obteniendo pedidos..."); }
      jQuery.post($localStorage.app.rest+"/sacadores.php?op=getPedidos", { id: $rootScope.sacador.IDSacador }, function(data) {
        $scope.hideload();
        
        if (data.res == "ERR") {
          $scope.emptyMessage = data.msg;
        }
        else {
          $rootScope.pedidos = data.data;
          //$ionicLoading.show({ template: '', noBackdrop: true, duration: 2000 });
        }
        $scope.$broadcast('scroll.refreshComplete');
        $rootScope.reloj = $timeout(function() {
          $scope.down();
        },1000);
        $rootScope.refreshing = 0;
      },"json");
    }
  }

  $scope.start = function() {

    if (!$localStorage.sacador) {
      setTimeout(function() { 
        $scope.modalConfiguracion.show();
        $scope.showload();
        jQuery.post($localStorage.app.rest+"/sacadores.php?op=getSacadores", { }, function(data) {
          $scope.hideload();
          if (data.res == "OK") {
            $rootScope.sacadores = data.data;
          } else {
            $rootScope.err(data.msg);  
          }
        },"json").fail(function(xhr) {
          $scope.hideload();
          $rootScope.err(xhr.responseText);
        });
      },500);
    }
    else {
      $rootScope.app = $localStorage.app;
      $scope.refresh();
    }
  }

  $scope.start();

  $scope.setSacador = function(sacador) {
    $rootScope.sacador = sacador;
  }
  $scope.confirmSacador = function() {
    if ($rootScope.hasOwnProperty("sacador") && $rootScope.sacador.hasOwnProperty("szUsuario")) {
      $rootScope.confirmar('¿Deseas dejar configurado este equipo para el sacador '+$rootScope.sacador.NombreSacador+'?', function() {
        $localStorage.sacador = $rootScope.sacador;
        $scope.modalConfiguracion.hide();
        $scope.start();
      });
    } else {
      $rootScope.err("Debes seleccionar un sacador");
    }
  }

})

String.prototype.toBytes = function() {
    var arr = []
    for (var i=0; i < this.length; i++) {
    arr.push(this[i].charCodeAt(0))
    }
    return arr
}

function miles(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? ',' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + '.' + '$2');
    }
    return x1 + x2;
}