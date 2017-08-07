angular.module('io').controller('AppCtrl', function($scope, $stateParams, $state, $rootScope, online, dbStore, appParams, $timeout) {

    $scope.kom = {};

    $scope.viewSr = function(sr) {
        $scope.setExitClass();


        $timeout(function() {
            appParams.params.viewSr = sr;
            $state.go('view', {
                'srNumber': sr.srId
            });
        }, 500);

        
    };

    $scope.srFilter = function(val){
        if($scope.srSearch && $scope.srSearch!==''){
            if(val.srId.toString().toUpperCase().indexOf($scope.srSearch.toString().toUpperCase())>-1){
                return val;
            }
            else if(val.customer.toString().toUpperCase().indexOf($scope.srSearch.toString().toUpperCase())>-1){
                return val;
            }
            else if(val.model.toString().toUpperCase().indexOf($scope.srSearch.toString().toUpperCase())>-1){
                return val;
            }
            else if(val.srDescription.toString().toUpperCase().indexOf($scope.srSearch.toString().toUpperCase())>-1){
                return val;
            }                
        }
        else {
            return val;
        }
        
    }

    $scope.setEntranceClass = function(){
        $scope.searchClass="fadeInDown";
        $scope.cardClass="fadeIn";
        $scope.srCardClass="fadeIn";
        $scope.srCardHeaderClass="fadeIn";    
    }

    $scope.setExitClass = function(){
        $scope.searchClass="fadeOutUp";
        $scope.cardClass="fadeOut";
        $scope.srCardClass="fadeOut";
        $scope.srCardHeaderClass="fadeOut";    
    }    

    $scope.home = {};
    $scope.home.notification = {};

    $scope.showNotification = function(header, msg) {
        $scope.home.notification.header = header;
        $scope.home.notification.content = msg;
        $timeout(function() {
            $scope.home.notification = {};
        }, 5000);
    }


    $rootScope.komList = $scope.komList;
    //Location : Begin
    $scope.checkInternet = function() {
        console.log('Check Internet Status | BEGIN');
        online.getStatus().then(function(res) {
            console.log('Check Internet Status | ' + res);
        });
    };


    $scope.setUpLocalDB = function() {
        dbStore.setUpofflineStore();
    };

    $scope.testOpenDB = function() {
        console.log(' Checking DB | Begin');

        dbStore.open().then(function(res) {
            console.log('Checking DB | OPEN ');
        }, function(err) {
            console.log('Checking DB | ERROR ');
        });

    };

    $scope.testQueryLocal = function(tableName, limit, params) {

    };

    $scope.testQueryRemote = function(tableName, limit, params) {
        dbStore.query(tableName, limit, params);
    };

    $scope.testAddObjectLocal = function() {

        var srObject = {
            _rs: 'I',
            model: 'XM350',
            customer: 'CloudIO',
            maintainance: 5,
            serialNumber: '20327XCI1234'

        };

        console.log(' Adding the Object | ' + JSON.stringify(srObject));
        dbStore.saveRow('KOMSRHeader', srObject).then(function(res) {
            console.log('Object Add | Success');
        }, function(err) {
            console.log('Object Add | Error');
        });

    };

    $scope.testAddObjectRemote = function() {

        var srObject = {
            _rs: 'I',
            srId: 34567,
            model: 'XM350',
            customer: 'CloudIO',
            maintainance: 5,
            serialNumber: '20327XCI1234'

        };

        console.log(' Adding the Object | ' + JSON.stringify(srObject));
        dbStore.saveRow('KOMSRHeader', srObject).then(function(res) {
            console.log('Object Add | Success');
        }, function(err) {
            console.log('Object Add | Error');
        });

    };

    $scope.testQuery = function() {

    };

    $scope.testUpdateObject = function() {

    };

    $scope.clearLocal = function() {
        dbStore.clearOfflineStore().then(function(res) {
            $scope.showNotification('SUCCESS', 'All the offline SRs cleared');
        }, function(err) {
            $scope.showNotification('ERROR', 'Could not clear all offline SRs.. please try again.');
        });
    };

    $scope.loadSR = function() {

        $scope.headerLoading = true;
        var queryParams = {
            params: {
                executeCountSql: 'N'
            }
        };

        dbStore.query('KOMSRHeader', 0, queryParams).then(function(res) {
            $scope.headerLoading = false;
            $scope.showNotification('SUCCESS', 'Loaded the Service Requests');
            $scope.komList = res;

            /* SAVE LOCAL CODE HERE*/
            online.getStatus().then(function(res){
                if(res === 'online'){
                    dbStore.loadOfflineData().then(function(res){
                        console.log('SUCCESS | LOAD OFFLINE DATA | '+res);
                    },function(err){
                        console.log('ERROR | LOAD OFFLINE DATA | '+err);
                    });
                }                
            },function(err){
                console.log('ERROR | LOAD OFFLINE DATA | '+err);
            });
            

        }, function(err) {
            $scope.headerLoading = false;
            $scope.showNotification('ERROR', 'Could not load the Service Requests... please try again.');
            console.log('ERROR | Unable to load the Service Requests | ' + JSON.stringify(err));
        });


    };

    $scope.testSync = function() {
        dbStore.sync().then(function(res) {
            $scope.showNotification('SUCCESS', 'Synced all the local SRs');
            console.log('TEST SYNC | SUCCESSFULL | ' + JSON.stringify(res));
        }, function(err) {
            $scope.showNotification('ERROR', 'Could not sync completely... please try again.');
            console.log('TEST SYNC | ERROR | ' + JSON.stringify(err));
        });
    }

    $scope.testSaveOffline = function(srId) {
        dbStore.saveOffline(srId).then(function(res) {
            $scope.showNotification('TEST SUCCESS', 'SR #' + srId + ' is downloaded for offline use.');
            console.log('TEST SAVE OFFLINE | SUCCESS | ' + res);
        }, function(err) {
            $scope.showNotification('TEST ERROR', 'Could not download the SR for offline use... please try again');
            console.log('TEST SAVE OFFLINE | ERROR | ' + err);
        });
    }

    $scope.saveOffline = function(srId) {
        $scope.headerSavingId = srId;
        dbStore.saveOffline(srId).then(function(res) {
            $scope.showNotification('SUCCESS', 'SR #' + srId + ' is downloaded for offline use.');
            $scope.headerSavingId = -1;
            console.log('SAVE OFFLINE | SUCCESS | ' + res);
        }, function(err) {
            $scope.showNotification('SUCCESS', 'SR #' + srId + ' is downloaded for offline use.');
            $scope.headerSavingId = -1;
            console.log('SAVE OFFLINE | ERROR | ' + err);
        });
    }

    $scope.getLocation = function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        } else {
            $scope.kom.location = 'N';
        }
    };

    function showPosition(position) {
        //    alert("Latitude: " + position.coords.latitude + "Longitude: " + position.coords.longitude);
        $scope.kom.location = 'Y';
        $scope.kom.locationInfo = 'Lat-' + position.coords.latitude + ' | Lon-' + position.coords.longitude;
    }

    function showError(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                $scope.showNotification('Info', "User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                $scope.showNotification('Info', "Location information is unavailable.");
                break;
            case error.TIMEOUT:
                $scope.showNotification('Info', "The request to get user location timed out.");
                break;
            case error.UNKNOWN_ERROR:
                $scope.showNotification('Info', "An unknown error occurred.");
                break;
        }
    }


    $scope.goOffline = function(val) {
        appParams.params.offlineMode = val;
    };

    

    $scope.init = function(){
        $scope.setEntranceClass();
        $scope.getLocation();
        $scope.setUpLocalDB();
        //$scope.checkInternet();
        $scope.loadSR();
        //$scope.clearLocal();

        //$scope.testSaveOffline(2);
        //$scope.testSync();
        //$scope.testOpenDB();
        //$scope.testAddObjectLocal(); 
        //$scope.testAddObjectRemote();
        //$scope.testQueryRemote('KOMSRHeader',10,null);
    }

    $scope.init();

    //Location : End

}).controller('viewController', function($scope, $rootScope, $state, $stateParams, appParams, dbStore, $timeout,$element,$window) {

    $scope.pageName = 'ViewPage';
    $scope.ko = {};
    $scope.ko.editSi = false;
    $scope.ko.editTi = false;
    $scope.ko.scrolled = false;

    angular.element($window).bind("scroll", function() {

        //var element = $element.find('#actionButtons');
        //var offset = angular.element( document.querySelector( '#actionButtons' ) ).offset().top;
        console.log('scrolled |'+ this.pageYOffset);

            if (this.pageYOffset >= 40) {
                 $scope.ko.scrolled = true;
                 console.log('scrolled | true');

             } else {
                 $scope.ko.scrolled = false;
                 console.log('scrolled | false');
             }

            
            /* if (this.pageYOffset >= 100) {
                 scope.boolChangeClass = true;
                 console.log('Scrolled below header.');
             } else {
                 scope.boolChangeClass = false;
                 console.log('Header is in view.');
             }
            scope.$apply();*/
        });


    $scope.editAction = function() {
        $scope.kom.editSr = true;
        $scope.ko.editSi = $scope.ko.editTi = true;
        customerSignature.on();
    };

    $scope.cancelAction = function() {
        $scope.kom.editSr = false;
        $scope.ko.editSi = $scope.ko.editTi = false;
        customerSignature.off();
    };

    $scope.submitAction = function(){
        
        if($scope.kom.srId){
            $scope.cancelAction();
            $scope.kom.submitFlag = 'Y';
            $scope.saveAction();
        }
        else {
            console.log('ERROR | Could not submit SR ');
        }
    };

    $scope.showNotification = function(header, msg) {
        $scope.home.notification.header = header;
        $scope.home.notification.content = msg;
        $timeout(function() {
            $scope.home.notification = {};
        }, 5000);
    };


    $scope.saveAction = function() {

        $scope.submitSR = true;

        $scope.kom.editSr = $scope.ko.editSi = $scope.ko.editTi = false;

        /* test code | BEGIN  */
        $scope.kom.customerSignature = JSON.stringify(customerSignature.toData());
        console.log('Customer Signature | ' + JSON.stringify($scope.kom.customerSignature));
        customerSignature.off();
        /*
         SUBMIT THE DATA

         Prepare SR Object & Update
         Prepare Line Items & Set Update & Insert Flags
         Prepare Travel Log Items & Set Update & Insert Flags

         Save the items
        */
        $scope.kom._rs = 'U';
        // Signature
        //$scope.kom.customerSignature = customerSignature.toData();

        var prArr = [];

        /* Save Line Info */
        if ($scope.kom.serviceList.length > 0) {
            angular.forEach($scope.kom.serviceList, function(val) {

                val.srId = $scope.kom.srId;
                /* Hande insert & assign F Key*/
                /* TO DO | Replace with SaveAll*/
                prArr.push(dbStore.saveRow('KOMSRLines', val)/*.then(function(res) {
                    console.log('Submit the SR Lines | Success | ' + JSON.stringify(val));
                }, function(err) {
                    console.log('Submit the SR Lines | Error | ' + JSON.stringify(val));
                })*/
                );
            });

        }

        /* Save Travel Info */
        angular.forEach($scope.kom.savedTravelList, function(val) {

            val.srId = $scope.kom.srId;
            /* Hande insert & assign F Key*/
            /* TO DO | Replace with SaveAll*/

            prArr.push(dbStore.saveRow('KOMSRTravelLog', val)/*.then(function(res) {
                console.log('Submit the SR Travel Log | Success | ' + JSON.stringify(val));
            }, function(err) {
                console.log('Submit the SR Travel Log | Error | ' + JSON.stringify(val));
            })*/
            );
        });


        /* TODO | Save Note Info */
           

        /* Save SR Info */
        prArr.push(dbStore.saveRow('KOMSRHeader', $scope.kom)/*.then(function(res) {
            console.log('Submit the SR Header | Success');
        }, function(err) {
            console.log('Submit the SR Header | Error');
        })
        */);

        //    serviceManagerSignature.fromData(customerSignature.toData());
        /* test code | END  */

        /* TODO | A cumulative promise & notification */
        Promise.all(prArr).then(function(res){
            console.log('Submitted all the changes to SR | Success');
            $scope.showNotification('SUCCESS','Changes to the SR submitted successfully');
        }).catch(function(err){
            console.log('Could not submit all the changes to SR... please try again | Error');
        })

    };

    $scope.goToHome = function() {
        $state.go('home');
    };
    $scope.submitSr = function() {
        $scope.kom.editSr = false;
        $scope.ko = {};
    };

    var customerSignature = new SignaturePad(document.getElementById('customerSignature'), {
        minWidth: 1,
        maxWidth: 3,
        backgroundColor: 'rgba(255, 255, 255, 0)',
        penColor: 'rgb(0, 0, 0)'
    });


   

    $scope.clearSignature = function(sec) {
        if (sec === 'customer') {
            customerSignature.clear();
        }
        /* else if(sec=='service'){
           serviceManagerSignature.clear();
         }*/
    };


    if (appParams.params.viewSr) {
        console.log('SR For View | ' + JSON.stringify(appParams.params.viewSr));

        /*
        	Load SR
        	Load SR Lines
        	Load SR Travel Info
        	Load SR Notes
        */
        $scope.kom = appParams.params.viewSr;

        $scope.kom.remoteAction= 'U';

        //Signature from DB
        //customerSignature.fromData($scope.kom.customerSignature);
        var queryParams = {};
        queryParams.whereClause = "#srId# = ?";
        queryParams.whereClauseParams = [appParams.params.viewSr.srId];



        var parsedData = JSON.parse($scope.kom.customerSignature);
        customerSignature.fromData(parsedData);
        customerSignature.off();

        dbStore.query('KOMSRLines', 0, queryParams).then(function(res) {
            angular.forEach(res,function(val){
                val.remoteAction = 'U';
            });
            $scope.kom.serviceList = res;
            console.log('Loaded the service req details for SR #' + $scope.kom.srId);
        }, function(err) {
            console.log('ERROR | Loading the service req details for SR #' + $scope.kom.srId+' | '+err);
        });

        dbStore.query('KOMSRTravelLog', 0, queryParams).then(function(res) {
            angular.forEach(res,function(val){
                val.remoteAction = 'U';
            });
            $scope.kom.savedTravelList = res;
            console.log('Loaded the Travel details for SR #' + $scope.kom.srId);
        }, function(err) {
            console.log('ERROR | Loading the Travel req details for SR #' + $scope.kom.srId);
        });

    } else {
        $scope.goToHome();
    }


});