//
angular.module('samsungcot.controllers', [])

.controller('AddCtrl', function($scope, $ionicScrollDelegate, $localStorage, filterFilter, $state, $location, $anchorScroll, $rootScope, $stateParams) {
	$scope.showload();
	$scope.addprod = {};
	//alert($scope.cotLista.length);
  res = [];
  $scope.resList=res;

	jQuery.post(app.restApi+'services/?action=buscar&store='+$localStorage.app.store, { str: $stateParams.search }, function(data) {
		$scope.hideload();
		//alert(JSON.stringify(data));
		if (data.items.length == 0) {
			$rootScope.err("No se encontraron productos");
			$state.go("main.cotizar");
		}
		else {
			jQuery.each(data.items, function(index) {
				res.push(data.items[index]);
			});
			//alert($scope.cotLista.length);
		}
	},"json").fail(function() { $rootScope.err("No responde el servidor, revise su conexión a internet"); $scope.hideload(); });

	$scope.cancelarAgregar = function() {
		$state.go("main.cotizar", { reload: true });
	};



})
.controller('AppCtrl', function($scope, $ionicModal, $timeout, $rootScope, $ionicSideMenuDelegate, $ionicPopup, $ionicLoading) {

})

.controller('CotizarCtrl', function($scope, $state, $rootScope, $localStorage, $location, $timeout, $ionicLoading, $ionicPopup) {

  $scope.lineaMenos = function(codigo) {
    for (var i = 0; i < $scope.cotLista.length ; i++) {
      if ($scope.cotLista[i].codigo == codigo) {
        if (parseInt($scope.cotLista[i].cantidad) < 1) {
          $rootScope.err("Minimo es 1");
        }
        else {
          $scope.cotLista[i].cantidad = (parseInt($scope.cotLista[i].cantidad) - 1);
          $scope.cotLista[i].total = ($scope.cotLista[i].precio * $scope.cotLista[i].cantidad); 
        }
        break;
      }
    }
    $scope.calcularTotales();
  };

  $scope.lineaMas = function(codigo) {
    for (var i = 0; i < $scope.cotLista.length ; i++) {
      if ($scope.cotLista[i].codigo == codigo) {
        $scope.cotLista[i].cantidad = (parseInt($scope.cotLista[i].cantidad) + 1);
        $scope.cotLista[i].total = ($scope.cotLista[i].precio * $scope.cotLista[i].cantidad); 
        break;
      }
    }
    $scope.calcularTotales();
  };
  $scope.lineaChao = function(codigo) {
    for (var i = 0; i < $scope.cotLista.length ; i++) {
      if ($scope.cotLista[i].codigo == codigo) {
        //delete $scope.cotLista[i]; // incompatible
        $scope.cotLista.splice(i, 1); // borra i
        break;
      }
    }
    $scope.calcularTotales();
  };

  $scope.terminar = function() {
   var confirmPopup = $ionicPopup.confirm({
    title: 'Terminar',
    template: '¿Quieres imprimir?',
    buttons: [{ 
      text: 'NO',
      type: 'button-default',
      onTap: function(e) {
        return '0'
      }
    }, {
      text: 'SI',
      type: 'button-positive',
      onTap: function(e) {
        return '1'
      }
    }]
   });

   confirmPopup.then(function(res) {
     $scope.imprimir(res);
   });
  
  };

  $scope.agregarProducto = function() {

  }

  $scope.limpiarCotizacion = function() {
    $rootScope.confirmar('¿Limpiar la cotización?', function() {
      $scope.cotLista = [];
    });
  
  };
  $scope.algo = "";

  $scope.buscarProducto = function() {

    $scope.data = { algo: '', pasillo: '', ean13: '', eancode: '' };

    var buscap = $ionicPopup.show({
      template: '<input type="text" class="buscador" ng-keypress="buscarEnter($event)" ng-model="data.algo">',
      title: 'Buscar producto',
      subTitle: '',
      scope: $scope,
      buttons: [
        { 
          text: 'Cerrar', 
          type: 'button-dark'
        },
        {
          text: '<b>Buscar</b>',
          type: 'button-positive',
          onTap: function(e) {
             if (!$scope.data.algo) {
              e.preventDefault();
             } else {
              if ($scope.data.algo.length > 1) {
                $state.go('main.add',{search:$scope.data.algo});
              }
              else {
                $rootScope.err('Ingrese 2 letras a lo menos');
              }
             }
          }
        }
      ]
    });

    $scope.buscarEnter = function(keyEvent) {
      if (keyEvent.which === 13) {
        if ($scope.data.algo.length > 1) {
          buscap.close();
          $state.go('main.add',{search:$scope.data.algo});
        }
        else {
          $rootScope.err('Ingrese 2 letras a lo menos');
        }
      }
    }

    $scope.buscarScanner = function(keyEvent) {
      if (keyEvent.which === 13) {
        if ($scope.data.algo.length > 1) {
          buscap.close();
          $state.go('main.add',{search:$scope.data.algo});
        }
        else {
          $rootScope.err('Ingrese 2 letras a lo menos');
        }
      }
    }
    
  };


  $scope.printRefresh = function() {
    $scope.cargandoPrinters = true;
    $scope.noPrinterFound = false;
    printers = [];
    $scope.printerList=printers;

    bluetoothSerial.list(function(devices) {
        $rootScope.err(JSON.stringify(devices));
    }, function(e) { $rootScope.err("err: ", JSON.stringify(e)); });

  };
  $scope.getCodigos = function() {
    var ret = [];
    for (var i = 0; i < $scope.cotLista.length ; i++) {
      ret.push($scope.cotLista[i].codigo);
    }
    return ret;
  }

  $scope.getCantidades = function() {
    var ret = [];
    for (var i = 0; i < $scope.cotLista.length ; i++) {
      ret.push($scope.cotLista[i].cantidad);
    }
    return ret;
  }
  $scope.getDescripciones = function() {
    var ret = [];
    for (var i = 0; i < $scope.cotLista.length ; i++) {
      ret.push($scope.cotLista[i].descripcion);
    }
    return ret;
  }

  $scope.getUnitarios = function() {
    var ret = [];
    for (var i = 0; i < $scope.cotLista.length ; i++) {
      ret.push($scope.cotLista[i].precio);
    }
    return ret;
  }

  $scope.getTotales = function() {
    var ret = [];
    for (var i = 0; i < $scope.cotLista.length ; i++) {
      ret.push($scope.cotLista[i].total);
    }
    return ret;
  }


  $scope.imprimir = function(like) {
    console.log('imprimir? '+like);
    function objetoImprimir() {

      var buffer = [];
      function _raw (buf) {
        buffer = buffer.concat(buf)
      }

      escpos(_raw)
      .hw()
      .set({align: 'center', width: 1, height: 2})
      .text($localStorage.app.comercio)
      .newLine(1)
      .text('COTIZACION')
      .newLine(1)
      .text('POINT SALE')
      .newLine(1)
      .text('---------------------------')
      .set({align: 'left', width: 1, height: 2})
      .newLine(1)
      .barcode($scope.getCodigos(),$scope.getCantidades(),$scope.getUnitarios(),$scope.getTotales(),$scope.getDescripciones(),'EAN13', 4, 90, 'BLW', 'B')
      .newLine(1)
      .set({align: 'center', width: 1, height: 2})
      .text('---------- TOTAL ----------')
      .newLine(1)
      .newLine(1)
      .set({align: 'left', width: 1, height: 2})
      .barcode2($scope.cotizacionNumber,'EAN13', 4, 90, 'BLW', 'B')
      .newLine(1)
      .text('$ '+miles($scope.neto))
      .set({align: 'center', width: 1, height: 1})
      .cut();

      return buffer;

    };

    if ($scope.cotLista.length == 0) {
      $rootScope.err("Cotizacion esta vacia");
    }
    else if (like == 1) {
      $scope.showload();
      bluetoothSerial.list(function(devices) {
        var printTo = "";
        var printName = "";
        devices.forEach(function(device) {
          if (device.name.toLowerCase().indexOf("abaprint") >= 0 || device.name.toLowerCase().indexOf("qsprinter") >= 0) {
            printTo = device.address;
            printName = device.name;
          }
        });

        if (printTo == "" && like == 1) {
          $scope.hideload();
          $rootScope.err('No se encontro impresora ABAPRINT o QSPRINTER. Enciendala o reintente sin imprimir');
        }
        else {
          // send server

          $scope.showload();
          jQuery.post(app.restApi+"services/?action=save&store="+$localStorage.app.store, {codes: $scope.getCodigos().join('|'), qtys: $scope.getCantidades().join('|'), descs: $scope.getDescripciones().join('|')}, function(data) {

            $scope.cotizacionNumber = data.cotizacion;

            if (like == 1) {
              var buffer = new Uint8Array(objetoImprimir()).buffer;

              bluetoothSerial.isConnected(
                  function() {
                      bluetoothSerial.write(buffer, function() {
                        $scope.hideload();
                        $scope.cotLista = [];
                      }, function() {
                        $scope.hideload();
                        $rootScope.err('No se pudo imprimir');
                      });
                  },
                  function() {
                      bluetoothSerial.connect(printTo, function() {
                        bluetoothSerial.write(buffer, function() {
                          $scope.hideload();
                          $scope.cotLista = [];
                        }, function() {
                          $scope.hideload();
                          $rootScope.err('No se pudo imprimir');
                        });
                      }, function() {
                        $scope.hideload();
                        $rootScope.err('No se pudo conectar con '+printName)
                      });
                  }
              );
            }
            else {
              $scope.cotLista = [];
            }

            $rootScope.ok('Cotizacion OK. Num. '+data.cotizacion);
            $scope.hideload();

          },"json");

        }
      }, function(e) { $rootScope.err("err: ",JSON.stringify(e)); });     
    } 
    else if (like==0) {
      $scope.showload();
      jQuery.post(app.restApi+"services/?action=save&store="+$localStorage.app.store, {codes: $scope.getCodigos().join('|'), qtys: $scope.getCantidades().join('|'), descs: $scope.getDescripciones().join('|')}, function(data) {

        $scope.cotizacionNumber = data.cotizacion;
        $rootScope.ok('Cotizacion OK. Num. '+data.cotizacion);
        $scope.hideload();
        $scope.cotLista = [];
        $scope.cotizacionNumber = 0;
        $scope.neto = 0;
        $scope.iva = 0;
        $scope.total = 0;

      },"json");
    }
  };


  $scope.impActivar = function(item) {
  
    $scope.showload();
    app.impNN = item.currentTarget.getAttribute("data-nombre");
    app.impID = $scope.printerbox.sel;
    $localStorage.app = app;

    ble.isConnected(app.impID, function() {
    }, function() {
        ble.connect(app.impID, function(peripheral) {
          $scope.hideload();
        }, function() { 
          $rootScope.err('Problemas al conectar a su impresora. Valla a configuracion o intente mas tarde.');
          $scope.hideload();
        });
    });
  };
})

.controller('HomeCtrl', function($scope, $state, $rootScope, $localStorage, $location, $timeout, $ionicLoading, $ionicPopup) {
  
  $scope.goCotizar = function() {
    $state.go("main.cotizar");
  }


})


.controller('MainCtrl', function($scope, $state, $localStorage, $rootScope, $location, $ionicLoading, $ionicSideMenuDelegate) {

  /* Scopes for cotizador */
  $scope.cotLista = [];
  $scope.printerbox = {};
  $scope.cargandoPrinters = false;
  $scope.noPrinterFound = false;
  printers = [];
  $scope.printerList=printers;
  $scope.cotizacionNumber = 0;
  $scope.neto = 0;
  $scope.iva = 0;
  $scope.total = 0;



  $ionicSideMenuDelegate.canDragContent(false);
 
  if (!$localStorage.app) { $localStorage.app = app;  }
  if ($localStorage.app.auth == 0) {
      $location.path( "login", false );
  }

  $scope.app = $localStorage.app;
  $scope.CallTel = function(tel) {
    window.location.href = 'tel:'+ tel;
  }
  $scope.onSwipeLeft = function($e) {
    $e.stopPropagation();
  };
  $scope.onSwipeRight = function($e) {
    $e.stopPropagation();
  };
  
  $scope.showload = function() {
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner>'
    }).then(function(){
       //console.log("The loading indicator is now displayed");
    });
  };
  $scope.hideload = function(){
    $ionicLoading.hide().then(function(){
       //console.log("The loading indicator is now hidden");
    });
  };


  $scope.agregarSeleccion = function(item) {
    if (item) { //$scope.addprod.sel
      // verificar existe
      console.log(item);
      var modificaExistente = 0;
      for (var i = 0; i < $scope.cotLista.length ; i++) {
        if ($scope.cotLista[i].codigo == item.codigo) {
          $scope.cotLista[i].cantidad = (parseInt($scope.cotLista[i].cantidad) + 1);
          $scope.cotLista[i].total = ($scope.cotLista[i].precio * $scope.cotLista[i].cantidad); 
          modificaExistente = 1;
          break;
        }
      }

      if (modificaExistente == 0) {
        item.cantidad = 1;
        item.total = (parseInt(item.precio) * 1);
        $scope.cotLista.push(item);
      }

      $scope.calcularTotales();
      $state.go("main.cotizar");

    }
    else {
      $rootScope.err('No esta agregando nada');
    }
  };

  $scope.calcularTotales = function() {
    var neto = 0;
    for (var i = 0; i < $scope.cotLista.length ; i++) {
      neto = parseInt(neto) + parseInt($scope.cotLista[i].total);
    }

    var iva = Math.round(neto * 0.19);
    var total = neto + iva;

    $scope.neto = neto;
    $scope.iva = iva;
    $scope.total = total;

  };



})

.controller('AndesCtrl', function($scope, $ionicPopup, $ionicLoading, $ionicHistory, $localStorage, $state, $rootScope, $location, $stateParams) {

  $scope.volver = function() { $ionicHistory.goBack(); }

  $scope.mm = function(x) {
    return (x.length > 30 ? x.substr(0,30)+"..." : x);
  };
  $scope.showload = function() {
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner>'
    }).then(function(){
       //console.log("The loading indicator is now displayed");
    });
  };
  $scope.hideload = function(){
    $ionicLoading.hide().then(function(){
       //console.log("The loading indicator is now hidden");
    });
  };


  $scope.datos = $stateParams.datos;
  $scope.columna = $stateParams.columna;
  $scope.pasillo = $stateParams.pasillo;
  $scope.fila = $stateParams.fila;
  $scope.lado = $stateParams.lado;
  $scope.data = { algo: '', pasillo: '', ean13: '', eancode: '' };
  console.log($scope.datos);

  $scope.borrarProducto = function(pasillo,lado,columna, fila,id) {

     var confirmaPopup = $ionicPopup.confirm({
      title: 'Terminar',
      template: 'Eliminar producto?: '+id,
      buttons: [{ 
        text: 'NO',
        type: 'button-default',
        onTap: function(e) {
          return '0'
        }
      }, {
        text: 'SI',
        type: 'button-positive',
        onTap: function(e) {
          return '1'
        }
      }]
     });
     confirmaPopup.then(function(res) {
       if (res==1) {
        $scope.showload();
        jQuery.post(app.restApi+'?action=borrar', { pasillo: pasillo, lado: lado, columna: columna, fila: fila, codigo: id }, function(data) {
          if (data.res == "OK") {
            var datos = [];
            var ultimaFila = "";
            var actual = {fila: "", data: null};
            for (var i = 0; i < data.data.length ; i++) {
              if (ultimaFila != data.data[i].Fila) {
                if (actual.data != null && actual.data.length > 0) {
                  datos.push(actual);
                }
                var actual = {fila: "", data: null};
                actual.data = [];
                actual.fila = data.data[i].Fila;
                actual.data.push(data.data[i]);
                ultimaFila = data.data[i].Fila;
              } else {
                actual.data.push(data.data[i]);
              }
            }
            if (ultimaFila!="") { datos.push(actual); }
            if (ultimaFila == "01") { 
              datos.push({fila: "02", data: []});
              datos.push({fila: "03", data: []});
              datos.push({fila: "04", data: []});
              datos.push({fila: "05", data: []});
            }
            else if (ultimaFila == "02") { 
              datos.push({fila: "03", data: []});
              datos.push({fila: "04", data: []});
              datos.push({fila: "05", data: []});
            }
            else if (ultimaFila == "03") { 
              datos.push({fila: "04", data: []});
              datos.push({fila: "05", data: []});
            }
            else if (ultimaFila == "04") { 
              datos.push({fila: "05", data: []});
            }

            if(data.data.length == 0) {
              datos.push({fila: "01", data: []});
              datos.push({fila: "02", data: []});
              datos.push({fila: "03", data: []});
              datos.push({fila: "04", data: []});
              datos.push({fila: "05", data: []});
            }

            $scope.datos = datos;
            $scope.hideload();
            console.log(datos);
          }
        },"json");
       }

       $scope.data.algo = "";
     });
  };

  $scope.agregarProducto = function(pasillo,lado,columna, fila) {
    var buscap =$ionicPopup.show({
      template: '<input type="text" class="buscador" ng-keypress="buscarEnter($event)" ng-model="data.algo">',
      title: 'Ingrese codigo producto',
      subTitle: '',
      scope: $scope,
      buttons: [
        { 
          text: 'Cerrar', 
          type: 'button-dark'
        },
        {
          text: '<b>Siguiente</b>',
          type: 'button-positive',
          onTap: function(e) {
             if (!$scope.data.algo) {
              e.preventDefault();
             } else {
              if ($scope.data.algo.length > 0) {
                jQuery.post(app.restApi+'?action=sku', { codigo: $scope.data.algo }, function(data) {
                  if (data.data[0].hasOwnProperty("Nombre")) {
                     var confirmPopup = $ionicPopup.confirm({
                      title: 'Terminar',
                      template: '<center><b>Agregando<br />'+data.data[0].Nombre+(!data.data2[0].hasOwnProperty("msgError") ? (data.data2[0].Columna != "" ? '<br /><span class="rojo">Ubic. Actual<br />'+data.data2[0].Ubicacion+'<br />REVISA LA UBICACION</span>' : '') : '')+'</b></center>',
                      buttons: [{ 
                        text: 'NO',
                        type: 'button-default',
                        onTap: function(e) {
                          return '0'
                        }
                      }, {
                        text: 'SI',
                        type: 'button-positive',
                        onTap: function(e) {
                          return '1'
                        }
                      }]
                     });

                     confirmPopup.then(function(res) {
                       if (res==1) {
                        $scope.showload();
                        jQuery.post(app.restApi+'?action=agrega', { pasillo: pasillo, lado: lado, columna: columna, fila: fila, codigo: $scope.data.algo }, function(data) {
                          if (data.res == "OK") {
                            var datos = [];
                            var ultimaFila = "";
                            var actual = {fila: "", data: null};
                            for (var i = 0; i < data.data.length ; i++) {
                              if (ultimaFila != data.data[i].Fila) {
                                if (actual.data != null && actual.data.length > 0) {
                                  datos.push(actual);
                                }
                                var actual = {fila: "", data: null};
                                actual.data = [];
                                actual.fila = data.data[i].Fila;
                                actual.data.push(data.data[i]);
                                ultimaFila = data.data[i].Fila;
                              } else {
                                actual.data.push(data.data[i]);
                              }
                            }
                            if (ultimaFila!="") { datos.push(actual); }
                            if (ultimaFila == "01") { 
                              datos.push({fila: "02", data: []});
                              datos.push({fila: "03", data: []});
                              datos.push({fila: "04", data: []});
                              datos.push({fila: "05", data: []});
                            }
                            else if (ultimaFila == "02") { 
                              datos.push({fila: "03", data: []});
                              datos.push({fila: "04", data: []});
                              datos.push({fila: "05", data: []});
                            }
                            else if (ultimaFila == "03") { 
                              datos.push({fila: "04", data: []});
                              datos.push({fila: "05", data: []});
                            }
                            else if (ultimaFila == "04") { 
                              datos.push({fila: "05", data: []});
                            }
                            $scope.datos = datos;
                            $scope.hideload();
                          }
                        },"json");
                       }
                       $scope.data.algo = "";
                     });
                  }
                  else {
                    $rootScope.err("No existe el codigo "+$scope.data.algo);
                  }
                  //$scope.data.algo="";
                });
              }
              else {
                $rootScope.err('Codigo muy corto');
              }
             }
          }
        }
      ]
    });
  }
})
.controller('LoginCtrl', function($scope, $ionicPopup, $ionicLoading, $ionicHistory, $localStorage, $state, $rootScope, $location) {
  $scope.user = {
    code: '',
    user: '',
    pass : ''
  };
  $scope.botonesLogin = true;


  /* XML 
  var soapRequest =
        '<?xml version="1.0" encoding="utf-8"?> \
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"> \
        <soapenv:Header/> \
          <soapenv:Body> \
            <ag:GetSacadores xmlns:ag="http://microsoft.com/webservices/"> \
            </ag:GetSacadores> \
          </soapenv:Body> \
        </soapenv:Envelope>';

  jQuery.ajax({
      type: "POST",
      url: "http://192.168.200.111:8092/Sacadores.asmx?wsdl",
      contentType: "text/xml",
      dataType: "xml",
      data: soapRequest
  }).then(function(data) { 
      //$rootScope.log('OK','DASH anulaPago', new XMLSerializer().serializeToString(data));
      var $xml = $( data );
      console.log($xml);
      //var msg = $xml.find('return>EL_MENSAJE').text();
      //var doctype = $xml.find('return>TEL_CODIGO').text();
      //var codigoAsoc = $xml.find('return>DDV_CODIGO').text();

  }, function(data) {
    console.log('pico');
  });
  */

  if (!$localStorage.app) { $localStorage.app = app; }

  if ($localStorage.app.auth == 1) {
    $state.go("main.home");
  }


  $scope.leerEan13 = function(e, value) {
    if (value.length >= 13) {
      if (value.length == 13) {
        $("#f2").focus();
      } 
      else {
        $rootScope.err('Codigo invalido');
        $scope.data.ean13='';
        $("#f1").focus();
      }
    }
  };

  $scope.leerEanAndes = function(e, value) {
    if (value.length >= 14) {
      if (value.length == 14) {
        e.preventDefault();
        $scope.asociarEANCODE();
      } 
      else {
        $rootScope.err('Codigo invalido');
        $scope.data.eancode='';
        $("#f2").focus();
      }
    }
  };

  $scope.equiparar = function() {
    console.log('equiparar');
    $scope.data = { algo: '', pasillo: '', ean13: '', eancode: '' };
    var buscap = $ionicPopup.show({
      template: '<input type="text" id="f1" class="buscador" placeholder="EAN 13" ng-keydown="leerEan13($event, data.ean13)" ng-model="data.ean13"><br><br><input type="text" class="buscador" ng-keydown="leerEanAndes($event, data.eancode)" ng-model="data.eancode" id="f2" placeholder="COD. ANDES">',
      title: 'Equiparar EAN 13',
      subTitle: '',
      cssClass: 'equiparar',
      scope: $scope,
      buttons: [
        { 
          text: 'Cerrar', 
          type: 'button-dark'
        },
        {
          text: '<b>Limpiar</b>',
          type: 'button-assertive',
          onTap: function(e) {
             e.preventDefault();
             $scope.data.ean13 = '';             
             $scope.data.eancode = '';
             setTimeout(function() { $('#f1').focus(); },500);
          }
        },
        {
          text: '<b>Asociar</b>',
          type: 'button-positive',
          onTap: function(e) {
             e.preventDefault();
             console.log('desde asociacion');
             $scope.asociarEANCODE();
          }
        }
      ]
    });

    setTimeout(function() { $('#f1').focus(); },500);
  }

  $scope.asociarEANCODE = function() {
    console.log('disparado!');
    if ($scope.data.ean13.length != 13) {
      $rootScope.err('Codigo invalido EAN-13');
      $scope.data.ean13 = '';
      $scope.data.eancode = '';
      setTimeout(function() { $('#f1').focus(); },500);
    }
    else if ($scope.data.eancode.length != 14) {
      $rootScope.err('Codigo invalido Andes');
      $scope.data.ean13 = '';
      $scope.data.eancode = '';
      setTimeout(function() { $('#f1').focus(); },500);
    }
    else {
      $scope.showload();
      console.log('post request');
      jQuery.post(app.restApi+'?action=asociar', { andes: $scope.data.eancode, ean: $scope.data.ean13 }, function(data) {
        if (data.res=="OK") {
          $rootScope.ok('Realizado OK!');
          $scope.data.ean13 = '';
          $scope.data.eancode = '';
          setTimeout(function() { 
            alertPopup.close(); 
            setTimeout(function() { $('#f1').focus(); },500);
          }, 2000);
        } else {
          $rootScope.err("NO SE ACTUALIZO EL REGISTRO");
        }
        $scope.hideload();
      },"json").fail(function() { $rootScope.err("No responde el servidor, revise su conexión"); $scope.hideload(); });
    }

  };

  
  $scope.leerScanner = function() {
    $scope.data = { algo: '', pasillo: '', ean13: '', eancode: '' };
    var buscap =$ionicPopup.show({
      template: '<input type="text" class="buscador" ng-keypress="buscarScanner($event)" ng-model="data.pasillo">',
      title: 'Ingrese pasillo con lector',
      subTitle: '',
      scope: $scope,
      buttons: [
        { 
          text: 'Cerrar', 
          type: 'button-dark'
        },
        {
          text: '<b>Siguiente</b>',
          type: 'button-positive',
          onTap: function(e) {
             if (!$scope.data.pasillo) {
              e.preventDefault();
             } else {
              $scope.dale($scope.data.pasillo);
             }
          }
        }
      ]
    });
  };

  $scope.leerColumna = function() {
  
    cordova.plugins.barcodeScanner.scan(
      function (result) {
          $scope.dale(result.text);
      },
      function (error) {
          $rootScope.err("Error de escaner: "+error);
      },
      {
          preferFrontCamera : false, // iOS and Android
          showFlipCameraButton : false, // iOS and Android
          showTorchButton : true, // iOS and Android
          torchOn: false, // Android, launch with the torch switched on (if available)
          saveHistory: false, // Android, save scan history (default false)
          prompt : "Por favor ajuste el codigo al centro", // Android
          resultDisplayDuration: 0, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
          formats : "QR_CODE,PDF_417,CODE_128,EAN_13,CODE_39", // default: all but PDF_417 and RSS_EXPANDED
          orientation : "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
          disableAnimations : true, // iOS
          disableSuccessBeep: false // iOS and Android
      }
    );
    
    /*$scope.dale("08A0101");*/
  }

  $scope.dale = function(text) {
        var pasillo = text.substr(0,2);
        var lado = text.substr(2,1);
        var fila = text.substr(3,2);
        var columna = text.substr(5,2);
        $scope.showload();
        jQuery.post(app.restApi+'?action=buscar', { pasillo: pasillo, lado: lado, columna: columna }, function(data) {


          if (data.res=="OK") {
            var datos = [];
            var ultimaFila = "";
            var actual = {fila: "", data: null};
            for (var i = 0; i < data.data.length ; i++) {
              if (ultimaFila != data.data[i].Fila) {
                if (actual.data != null && actual.data.length > 0) {
                  datos.push(actual);
                }
                var actual = {fila: "", data: null};
                actual.data = [];
                actual.fila = data.data[i].Fila;
                actual.data.push(data.data[i]);
                ultimaFila = data.data[i].Fila;
              } else {
                actual.data.push(data.data[i]);
              }
            }
            if (ultimaFila!="") { datos.push(actual); }
            if (ultimaFila == "01") { 
              datos.push({fila: "02", data: []});
              datos.push({fila: "03", data: []});
              datos.push({fila: "04", data: []});
              datos.push({fila: "05", data: []});
            }
            else if (ultimaFila == "02") { 
              datos.push({fila: "03", data: []});
              datos.push({fila: "04", data: []});
              datos.push({fila: "05", data: []});
            }
            else if (ultimaFila == "03") { 
              datos.push({fila: "04", data: []});
              datos.push({fila: "05", data: []});
            }
            else if (ultimaFila == "04") { 
              datos.push({fila: "05", data: []});
            }
            if(data.data.length == 0) {
              datos.push({fila: "01", data: []});
              datos.push({fila: "02", data: []});
              datos.push({fila: "03", data: []});
              datos.push({fila: "04", data: []});
              datos.push({fila: "05", data: []});
            }


            
            $state.go("col", {pasillo: pasillo, lado: lado, columna: columna, datos: datos });
          } else {
            $rootScope.err("NO ENCONTRO RESULTADOS");
          }
          $scope.hideload();
        },"json").fail(function() { $rootScope.err("No responde el servidor, revise su conexión"); $scope.hideload(); });
  }

  $scope.showload = function() {
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner>'
    }).then(function(){
       //console.log("The loading indicator is now displayed");
    });
  };
  $scope.hideload = function(){
    $ionicLoading.hide().then(function(){
       //console.log("The loading indicator is now hidden");
    });
  };

});


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
function eanCheckDigit(s){
    var result = 0;
    for (counter = s.length-1; counter >=0; counter--){
        result = result + parseInt(s.charAt(counter)) * (1+(2*(counter % 2)));
    }
    return (10 - (result % 10)) % 10;
}