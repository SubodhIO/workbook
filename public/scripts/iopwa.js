var app = angular.module('iopwa',[]);

/************************ PARAMS ************************/
app.service('appParams',function(){
	/*
		will be used to share param values across ops
	*/
	this.params = {};
	this.params.dbName = 'komoriOFFLINE';
	this.params.dbVersion = 1;
	this.params.dbTables = [
					{
						name : "KOMSRHeader",
						primarykey : "indexId",
					},
					{
						name : "KOMSRLines",
						primarykey : "indexId",
					},
					{
						name : "KOMSRNotes",
						primarykey : "indexId",
					},
					{
						name : "KOMSRTravelLog",
						primarykey : "indexId",
					},
					{
						name : "KOMLocationAudit",
						primarykey : "indexId",
					}
				];	
	this.params.onlineDbStore = {
		api:'https://komori.cloudio.io/api',
		username : 'admin',
		password : 'c2vc1970aeS',
		sessionId : null
	};

	this.params.primarykey = {
		'KOMSRHeader' : 'srId',
		'KOMSRLines' : 'lineId',
		'KOMSRNotes' : 'noteId',
		'KOMSRTravelLog' : 'logId',
		'KOMLocationAudit' : 'auditId'
	};

	this.params.offlineMode  = false;

	this.params.offline = {};
	this.params.offline.srHeaderList = [];
	this.params.offline.srLineList = [];
	this.params.offline.srNoteList = [];
	this.params.offline.srTravelLogList = [];

});
/************************ CONNECTIVITY CHECK ************************/
app.service('online',function($rootScope,$http,$q,appParams){
	this.getStatus = function(){
		return $q(function(resolve,reject){
			var url = 'ping.html';

			if(appParams.params.offlineMode){
				resolve('offline');
			}
			else {
				$http.get(url).then(function(response){
					resolve('online');
				}, function(error){
					resolve('offline');
				});				
			}


		});
	}
});

/************************ OFFLINE ************************/
app.service('offlineDbStore',function($q,online,appParams){

	var store = this;
	var dbName,dbVersion,dbObjects;

	store.db = null;

	/*
		initiate Local DB
		check for version & upgrade
		proceed on CRUD ops
	*/


	/*OFF*/
	store.createObjectStore = function(objectStore){
		/* use it to create objectStores(Tables in IndexedDB)*/
	};
	/*OFF*/
	store.open = function() {
		return $q(function(resolve, reject) {

			if(store.db != null){
				resolve("sucess");
				return;
			}

			dbName = appParams.params.dbName;
			dbVersion = appParams.params.dbVersion;
			dbObjects = appParams.params.dbTables;

			window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
			window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange

			if (!window.indexedDB) {
				console.log('OFFLINEDBSTORE | Your browser does not support a stable version of IndexedDB.');
			    window.alert("OFFLINEDBSTORE | Your browser doesn't support a stable version of IndexedDB.");
			    reject("Your browser doesn't support a stable version of IndexedDB.");
			    return;
			}
			
			request = window.indexedDB.open(dbName, dbVersion);

			request.onerror = function(event) {
				reject("OFFLINEDBSTORE | Error while opening db!");
			};

			request.onsuccess = function(event) {
				store.db = request.result;
				resolve("success");
			};

			request.onupgradeneeded = function(event) {
				var db = event.target.result;
				var object;
				for(var i =0; i < dbObjects.length; i++){
					object = dbObjects[i];
					console.log('OFFLINEDBSTORE | creating the Object Store '+object.name);
					db.createObjectStore(object.name, {
						keyPath : object.primarykey,
						autoIncrement : true
					});
					/* 
						CODE FOR QUERY

						// In your query section
						var transaction = db.transaction('mystore','readonly');
						var store = transaction.objectStore('mystore');
						var index = store.index('myindex');
						// Select only those records where prop1=value1 and prop2=value2
						var request = index.openCursor(IDBKeyRange.only([value1, value2]));
						// Select the first matching record
						var request = index.get(IDBKeyRange.only([value1, value2]));

					*/
				}


				resolve("success");
			}
		});
	}

	/*OFF*/
	store.clearAll = function(){
		return $q(function(resolve,reject){
			store.open().then(function(res){

				var tableList = ['KOMSRNotes','KOMSRTravelLog','KOMSRLines','KOMSRHeader'];

				var transaction = store.db.transaction(tableList,'readwrite');

				/* BAD | NEED A BETTER SOLUTION */
				var os0 = transaction.objectStore(tableList[0]);
				var r0 = os0.clear();

				r0.onsuccess = function(event){

					var os1 = transaction.objectStore(tableList[1]);
					var r1 = os1.clear();

					r1.onsuccess = function(event){

						var os2 = transaction.objectStore(tableList[2]);
						var r2 = os2.clear();

						r2.onsuccess = function(event){

							var os3 = transaction.objectStore(tableList[3]);
							var r3 = os3.clear();

							r3.onsuccess = function(event){
								resolve('success');
							}

							r3.onerror = function(err){
								reject(err);
							}
						}

						r2.onerror = function(err){
							reject(err);
						}						
					}

					r1.onerror = function(err){
						reject(err);
					}					
				};

				r0.onerror = function(err){
					reject(err);
				}

				
			},function(err){
				reject('error');
			});
		});
	};
	/*OFF*/
	store.query = function(tableName,params){
		/* 
			if PARAMS is NULL
				QUERY all
			else
				QUERY with params
		*/

        var storeData=[];


		return $q(function(resolve,reject){
			if(tableName){
				/*
					FETCH ALL DATA
				*/
				store.open().then(function(res){
					// Get the access to table
					var transaction = store.db.transaction([tableName]);
					var objectStore = transaction.objectStore(tableName);

					//var storeIndex = objectStore.index('indexSrId');

					/*	var transaction = db.transaction('mystore','readonly');
						var store = transaction.objectStore('mystore');
						var index = store.index('myindex');
						// Select only those records where prop1=value1 and prop2=value2
						var request = index.openCursor(IDBKeyRange.only([value1, value2]));
						// Select the first matching record
						var request = index.get(IDBKeyRange.only([value1, value2])); */



					// Query the table

					/*transaction.oncomplete = function(event){
						console.log('OFFLINEDBSTORE | Query success | '+JSON.stringify(objectStore));	
						resolve(storeData);
					};

					transaction.onerror = function(event){
						reject('OFFLINEDBSTORE | Query Error ');
					};*/
					var req = objectStore.openCursor();
					//var req = objectStore.openCursor();

					req.onsuccess = function(event){
						var cursor = event.target.result;
						if(cursor){
							console.log('OFFLINEDBSTORE | Query '+tableName);
							cursor.value.stored = true;
							// Filter code
							if(params && Object.keys(params).length>0){
								Object.keys(params).forEach(function(k){
									console.log('***'+cursor.value[k]);
									if(cursor.value[k]==params[k]){
										storeData.push(cursor.value);		
									}
								});
							}
							else{
								storeData.push(cursor.value);	
							}
							
							cursor.continue();
						}
						else {
							console.log('OFFLINEDBSTORE | Query '+tableName+' | All entries done.');
							console.log(JSON.stringify(storeData));
							resolve(storeData);
						}
					};

					req.onerror = function(err){
						console.log('OFFLINEDBSTORE | Query '+tableName+' | ERROR.');
						reject(err);
					};


					if(params){
						/* FILTER CODE*/
						/* CHECK IF INDECES ARE PLAUSIBLE */
					}
					/* return the table data*/
					
				}, 
				function(err){
					reject('ERROR | could not open the store '+tableName);
				});
			}
			else {
				console.log('OFFLINEDBSTORE | Cannot query the empty tablename');
				reject('ERROR | No Tablename specified');
			}

		});

		

	};

	store.saveRow = function(tableName,row){
		return $q(function(resolve,reject){
			resolve('success');
		});		
	}

	store.saveAll = function(tableName,rows){
		return $q(function(resolve,reject){
			resolve('success');
		});	
	}

	store.clearTable = function(tableName){
		return $q(function(resolve,reject){
			resolve('success');
		});
	};

});
/************************ ONLINE ************************/
app.service('onlineDbStore',function($q,online,appParams,$http){
	var store = this;

	store.open = function(){
		/* SIGN IN TO API */
		return $q(function(resolve,reject){

			/* TO DO | have the code for session validation & reinitiate a new one if fails */
			if(appParams.params.onlineDbStore.sessionId!==null){
				resolve('sucess');
				return;
			}
			else {
					$http.post(appParams.params.onlineDbStore.api+'/signin',{username: appParams.params.onlineDbStore.username,
					password: appParams.params.onlineDbStore.password}).then(function(res){
						if(res.data.status === 'ERROR'){
							appParams.params.onlineDbStore.sessionId = null;
							console.log('ONLINEDBSTORE | Could not sign in to the API');
							reject('ERROR');
						}
						else {
							appParams.params.onlineDbStore.sessionId = res.data.sessionId;
							resolve(res.data.sessionId);
							console.log('ONLINEDBSTORE | Sign in to API Successful | Session Id : '+res.data.sessionId);
							
						}
					});		
			}
	
		});
	};

	store.sync = function(tableName,rows){
		return $q(function(resolve,reject){

			store.open().then(function(res){
				if(rows.length>0){

					var inClause = '';

					angular.forEach(rows,function(val){
						if(inClause!==''){
							inClause+=',';
						}
						inClause+=val.srId;
					});


					var queryParams = {
						params: {
							executeCountSql: 'N'
						},
						whereClause: " #srId# in ("+inClause+") "
					};

					queryParams.sessionId = appParams.params.onlineDbStore.sessionId;

					$http.post(appParams.params.onlineDbStore.api+'/'+tableName,queryParams).then(function(res){
						resolve(res);
					},function(err){
						reject(err);
					});


				}
				else {
					resolve('success');
				}	

			},function(err){
				reject(err);
			});

				
		});
	};

	store.query = function(tableName,params){
		return $q(function(resolve,reject){

			store.open().then(function(res){

				/*var queryParams = 

				if(tableName!='KOMSRHeader'){

					queryParams.whereClause = "#srId# = ?";
          			queryParams.whereClauseParams = [appParams.params.viewSr.srId];
				}*/

				//params.sessionId = appParams.params.onlineDbStore.sessionId;

				var queryParams = {
					params: {
						executeCountSql: 'N'
					}
				};

				/*queryParams.whereClause = "#srId# = ?";
	          	queryParams.whereClauseParams = [srId];*/

	          	if(params && Object.keys(params).length>0 ){

		          	queryParams.whereClause = "";
					queryParams.whereClauseParams = [];


					Object.keys(params).forEach(function(k){
						console.log('K | '+k+' / V | '+params[k]);
						if(queryParams.whereClause !== ""){
							queryParams.whereClause += " and ";
						}
						queryParams.whereClause += " #"+k+"# = ? ";

						queryParams.whereClauseParams.push(params[k]);

					});

	          	}


				queryParams.sessionId = appParams.params.onlineDbStore.sessionId;

				$http.post(appParams.params.onlineDbStore.api+'/'+tableName,queryParams).then(
						function(res){

							if(res.data.status === 'ERROR'){
								console.log('ONLINEDBSTORE | QUERY | Error | '+tableName);
								reject(res.data);
							}
							else {
								console.log('ONLINEDBSTORE | QUERY | Success | '+tableName);
								//console.log(JSON.stringify(res.data.data));
								resolve(res.data.data);								
							}

						},
						function(err){
							console.log('ONLINEDBSTORE | QUERY | ERROR | '+tableName);
							reject('error');							
						}
					);



			},function(err){
				
				console.log('ONLINEDBSTORE | QUERY | Error | '+tableName);
				reject('error');

			});

		});	
	};

	store.saveRow = function(tableName,row){
		return $q(function(resolve,reject){
			resolve('success');
		});		
	}

	store.saveAll = function(tableName,rows){
		return $q(function(resolve,reject){
			resolve('success');
		});	
	}
});

/************************ SYNC ************************/
app.service('syncDbStore',function($q,offlineDbStore,onlineDbStore,online,appParams){
	var store = this;

	store.query = function(tableName,params){
		return $q(function(resolve,reject){
			resolve('success');
		});	
	};

	store.saveRow = function(tableName,row){
		return $q(function(resolve,reject){
			resolve('success');
		});		
	};

	store.saveAll = function(tableName,rows){
		return $q(function(resolve,reject){
			resolve('success');
		});	
	}
});

/************************ STORE ************************/
app.service('dbStore',function($q,offlineDbStore,onlineDbStore,syncDbStore,online,appParams){

	var store = this;
	var syncStore = {};
	var mapData = {};
	var mapDbData = {};

	store.syncOfflineDbStore = function(tableName){
		return $q(function(resolve,reject){

			if(syncStore[tableName] && syncStore[tableName].length>0){

				offlineDbStore.query(tableName,{}).then(function(res){

					angular.forEach(res,function(val){
						mapDbData[val.srId] = val; 
					});

					angular.forEach(syncStore[tableName],function(val){
						mapData[val.srId] = val;
					});				

					angular.forEach(res,function(val){
						// if the data contains matching from DB 
						if(mapData[val.srId]){
							if(mapData[val.srId].lastUpdateDate>val.lastUpdateDate){
								console.log('OFFLINE SYNC | data to DbData');
							}
							else {
								console.log('OFFLINE SYNC | data from DbData');
							}
						}
					});

					resolve('success');


				},function(err){
					reject(err);
				});


			}	
			else{
				resolve('success');	
			}		
			
		});
	};

	store.syncOnlineDbStore = function(tableName){
		return $q(function(resolve,reject){
			if(syncStore[tableName] && syncStore[tableName].length>0){

				onlineDbStore.sync(tableName,syncStore[tableName]).then(function(res){
					resolve('success');
				},function(err){
					reject(err);
				})

			}	
			else{
				resolve('success');	
			}		
		});
	};

	store.sync = function(tableName){
		return $q(function(resolve,reject){
			//if(syncStore[tableName] && syncStore[tableName].length>0)
			if(true)
			{
				store.syncOfflineDbStore(tableName).then(function(res){
					store.syncOnlineDbStore(tableName).then(function(res){
						resolve('success');
					},function(err){
						reject(err);
					});
				},function(err){
					reject(err);
				});
			}
			else {
				resolve(syncStore[tableName]);
			}
		});
	};

	store.loadStore = function(tableName,params){
		return $q(function(resolve,reject){
			online.getStatus().then(function(res){
				if(res==='online'){

					onlineDbStore.query(tableName,params).then(function(res){
						syncStore[tableName] = res;
 						resolve(syncStore[tableName]);
					},function(err){
						reject(err);
					});

				}
				else if(res==='offline'){
					offlineDbStore.query(tableName,params).then(function(res){
						syncStore[tableName] = res;
						resolve(syncStore[tableName]);
					},function(err){
						reject(err);
					});
					
				}
			},function(err){
				reject(err);
			});
		});	
	}

	store.query = function(tableName,params){
		return $q(function(resolve,reject){

			store.sync(tableName).then(function(res){
				console.log('SYNC success');
				store.loadStore(tableName,params).then(function(res){
					resolve(res);
				},function(err){
					reject(err);
				});
			},function(err){
				console.log('SYNC Error');
				store.loadStore(tableName,params).then(function(res){
					resolve(res);
				},function(err){
					reject(err);
				});
			});	
			
		});
	};

	store.queryOffline = function(tableName,params){
		return $q(function(resolve,reject){
			offlineDbStore.query(tableName,params).then(function(res){
						resolve('success');
					},function(err){
						reject(err);
					});
		});
	};


	store.saveRow = function(tableName,row){

	}

	store.saveAll = function(tableName,rows){

	}


});	


