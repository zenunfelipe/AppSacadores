//
angular.module('andes.controllers', [])


.controller('DetalleCtrl', function($scope, $state, $rootScope, $ionicHistory, $localStorage, $location, $ionicModal, $timeout, $ionicLoading, $ionicPopup, $stateParams) {
  $scope.pedido = $stateParams.pedido;
  $scope.detalle = [];
  $scope.itemsPendientes = 0;
  $scope.popCloseable = null;

  $scope.$on('$ionicView.beforeLeave', function(obj, viewData){
    $rootScope.viendoDetalle = 0;
    if (window.cordova) {
    	window.cordova.plugins.honeywell.disableTrigger(() => console.info('trigger disabled')); 
	}
  }); 
  $scope.$on('$ionicView.afterEnter', function(obj, viewData){
    $rootScope.viendoDetalle = 1;
    if (window.cordova) {
    	window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled'));
	}
  }); 

  $ionicModal.fromTemplateUrl('templates/notification.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modalNotification = modal;
  });

  $scope.$on("open-notification", function(event, args) {
    $scope.modalNotification.show();
  });

  $scope.closeNotification = function() {
    $scope.modalNotification.hide();
  }
  $scope.$on('scanner', function(event, args) {
    console.log('scanner reader');
    console.log(args);
    if ($rootScope.readmode == 0) {
      console.log('read mode');
      if (args.hasOwnProperty("data") && args.data.success == true) {
        if (window.cordova) { window.cordova.plugins.honeywell.disableTrigger(() => console.info('trigger disabled')); }
        $scope.showload();
        jQuery.post($localStorage.app.rest+"/sacadores.php?op=actualizarPicking", { 
          IDOperacion: $scope.pedido.IDOperacion, 
          AnnoProceso: $scope.pedido.AnnoProceso, 
          Correlativo: $scope.pedido.Correlativo, 
          CodigoBarras: args.data.data,
          Cantidad: 1,
          IDUsuario: $rootScope.sacador.szUsuario
        }, function(data) {
          $scope.hideload();
          if (data.res == "ERR") {
            if (window.cordova) { navigator.notification.beep(1); }
            $rootScope.err(data.msg, function() {
              if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
            });
          }
          else {
            if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
            $scope.detalle = data.PedidoDetalles;
            $scope.itemsPendientes = 0;
            for (var i = 0; i < $scope.detalle.length; i++) {
              $scope.itemsPendientes += ($scope.detalle[i].Cantidad - data.data[i].CantidadPicking);
            }
          }
        },"json").fail(function() {
          $scope.hideload();
          if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
          $rootScope.err("Pedido no es accesible");
          $ionicHistory.goBack();
        });
      }
    }
    else if ($rootScope.readmode == 1) {
      console.log('delete mode');
      $scope.popCloseable.close();
      $scope.deleteItem(args.data.data, -1);
    }
  });

  if (!$scope.pedido && !$scope.pedido.hasOwnProperty("IDOperacion")) {
    $rootScope.err("Pedido no es accesible");
    $ionicHistory.goBack();
  }
  $scope.readDelete = function() {
    $rootScope.readmode = 1;
    $scope.popCloseable = $rootScope.ok("Lea el código a reversar","Eliminando un codigo", function() {
      $rootScope.readmode = 0;
    }, "Cancelar");
  };

  $scope.deleteItem = function(IDarticulo, Cantidad) {
      $rootScope.readmode = 0;
      if (window.cordova) { window.cordova.plugins.honeywell.disableTrigger(() => console.info('trigger disabled')); }
      $scope.showload();
      jQuery.post($localStorage.app.rest+"/sacadores.php?op=actualizarPicking", { 
        IDOperacion: $scope.pedido.IDOperacion, 
        AnnoProceso: $scope.pedido.AnnoProceso, 
        Correlativo: $scope.pedido.Correlativo, 
        CodigoBarras: IDarticulo,
        Cantidad: Cantidad,
        IDUsuario: $rootScope.sacador.szUsuario
      }, function(data) {
        $scope.hideload();
        if (data.res == "ERR") {
          if (window.cordova) { navigator.notification.beep(1); }
          $rootScope.err(data.msg, function() {
            if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
          });
        }
        else {
          if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
          $scope.detalle = data.PedidoDetalles;
          $scope.itemsPendientes = 0;
          for (var i = 0; i < $scope.detalle.length; i++) {
            $scope.itemsPendientes += ($scope.detalle[i].Cantidad - data.data[i].CantidadPicking);
          }
        }
      },"json").fail(function() {
        $scope.hideload();
        if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
        $rootScope.err("Pedido no es accesible");
        $ionicHistory.goBack();
      });
  }
  $scope.ended = function() {
    // Todo Notifications
    if ($scope.itemsPendientes > 0) {
      $rootScope.confirmar('Existen '+$scope.itemsPendientes+' lineas pendientes, ¿deseas terminar el pedido ahora?', function() {
        $scope.close();
      });
    } else {
      $scope.close();
    }
  }

  $scope.close = function() {
    $scope.showload();
    jQuery.post($localStorage.app.rest+"/sacadores.php?op=actualizarEstado", {
      AnnoProceso: $scope.pedido.AnnoProceso,
      IDOperacion: $scope.pedido.IDOperacion,
      Correlativo: $scope.pedido.Correlativo,
      IDEtapa: 1,
      IDEstado: 5,
      IDSacador: $rootScope.sacador.IDSacador,
      IDUsuario: $rootScope.sacador.szUsuario
    }, function(data) {
      $scope.hideload();
      $ionicHistory.goBack();
    }).fail(function() {
      $scope.hideload();
      $rootScope.err();
    });
  }

  $scope.refreshPedido = function() {
      $scope.showload("actualizando..."); 
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


.controller('MainCtrl', function($scope, $state, $localStorage, $timeout, $interval, $ionicModal, $rootScope, $location, $ionicLoading, $ionicSideMenuDelegate) {

  $ionicSideMenuDelegate.canDragContent(false);

  $rootScope.wifi = "The Wifi controller is OK";
  $rootScope.wifi2 = "..";
  $rootScope.wifi3 = "....";
  $rootScope.refreshing = 0;
  $rootScope.segs = 59;
  $rootScope.reloj = null;
  $rootScope.pedidos = [];
  $rootScope.sacadores = [];
  $rootScope.emptyMessage = "";

  // Run the Wifi Scanner
  if (window.cordova) {
    $rootScope.intervalRunning = 1;
    $interval(function() {
      $scope.wifi = "Interval called!";
      cordovaNetworkManager.startScan(function() {
        $scope.wifi2 = "Success start scan call";
      }, function() {
        $scope.wifi2 = "fail start scan call";
      });

      $timeout(function() {
        $scope.wifi2 = "standalone";

        cordovaNetworkManager.getScanResults({ numLevels: 10 }, function(networks) {
          $scope.wifi3 = "<pre>"+JSON.stringify(networks, null, 4)+"</pre>";
        }, function() {
          $scope.wifi3 = "Fail on get scan results";
        });
      },6000);
    }, 8000);
  }

  // Start controller

  $ionicModal.fromTemplateUrl('templates/config.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modalConfiguracion = modal;
  });

  $scope.openNotification = function() {
    $rootScope.$broadcast("open-notification");
  }


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