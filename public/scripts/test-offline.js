var app = angular.module('testoffline',[]);

app.directive('loader',function(){
	return {
		restrict:'AE',
		replace: false,
		templateUrl: './views/loader.html'
	}
});

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

/* SERVICE TO CHECK THE CONNECTIVITY */
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

/* SERVICE TO LOCAL DB ACCESS */
app.service('offlineDbStore',function($q,appParams){
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
	store.query = function(tableName,limit,params){
		/* 
			if PARAMS is NULL
				QUERY all
			else
				QUERY with params
		*/

        var storeData=[];

        if(!limit){
        	limit = 20;
        }

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
	/*OFF*/
	store.saveRow = function(tableName,row){

		return $q(function(resolve,reject){

			store.open().then(function(res){

				if(row!=null){
					console.log('OFFLINEDBSTORE | Save Row | Inserting the row | ');

					var transaction = store.db.transaction([tableName],'readwrite');

					transaction.oncomplete = function(event){
						resolve('TRANSACTION ADD success');
					};

					transaction.onerror = function(event){
						reject('TRANSACTION ADD error');
					}

					var objectStore = transaction.objectStore(tableName);

					/*row._rs = 'I';

					if(row.stored){
						row._rs = 'U';
					}*/
					/* TBD */
					row._rs = row.remoteAction;

					if(row._rs === 'I'){
						var req = objectStore.add(row);
						req.onsuccess = function(event){
							console.log('OFFLINEDBSTORE | Save Row | Insert | Success | '+tableName);
							resolve('success');

						};
						req.onerror = function(event){
							console.log('OFFLINEDBSTORE | Save Row | Insert | Error | '+tableName);
							reject('error');
						};
					}
					else if(row._rs === 'U'){
						//TODO | check primary key
						var req = objectStore.put(row)
						req.onsuccess = function(event){
							console.log('OFFLINEDBSTORE | Save Row | Update | Success | '+tableName);
							resolve('success');

						};
						req.onerror = function(event){
							console.log('OFFLINEDBSTORE | Save Row | Update | Error | '+tableName);
							reject('error');
						};
					}
					else if(row._rs === 'D'){
						/*objectStore.delete(row).onsuccess(function(event){

						}).onerror(function(event){

						});*/
					}
					else {
						console.log('OFFLINEDBSTORE | ERROR | No ROW STATUS UPDATED ');
						reject('ERROR | No ROW STATUS UPDATED');
					}


				}
				else{
					console.log('OFFLINEDBSTORE | Save Row  cannot insert null row');
					reject('ERROR | Save Row  cannot insert null row');
				}

			},function(err){
				console.log('OFFLINEDBSTORE | SaveRow | ERROR | '+err);
				reject('error');
			});


				
		});

	};
	/*OFF*/
	store.saveAll = function(tableName,rows){

		return $q(function(resolve,reject){

			var promiseArray = [];
			if(rows.length>0){

					angular.forEach(rows,function(val){
						/*val._rs = 'I';

						if(val.stored){
							val._rs = 'U';
						}
						
						val.deleteFlag='N';*/
						val.lastModifiedDate = new Date();
						promiseArray.push(store.saveRow(tableName,val));
					});

					Promise.all(promiseArray).then(function(res){
						resolve('success');
					}).catch(function(err){
						reject(err);
					});	

			}

			else {
				resolve('success');
			}

		});



	};

});

app.service('onlineDbStore',function($q,$http,appParams){

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

	store.query = function(tableName,limit,params){

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
					},
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

	store.insertRow = function(tableName,row){

		return $q(function(resolve,reject){

			store.open().then(function(res){

				if(row!=null){

					row.sessionId = appParams.params.onlineDbStore.sessionId;

					$http.post(appParams.params.onlineDbStore.api+'/'+tableName+'/insert',row).then(
							function(res){
								if(res.data.status==='ERROR'){
									reject(res.data);
								}
								else {
									console.log('ONLINEDBSTORE | SAVE ROW | Success ');				
									console.log(JSON.stringify(res.data));
									resolve(res.data);
								}
							}
						);

					
				}
				else {
					console.log('ONLINEDBSTORE | SAVE ROW | Error');
					reject('Error');
				}


			},function(err){
				console.log('ONLINEDBSTORE | SAVE ROW | Error');
				reject('Error');
			});

		});
	};


	store.saveRow = function(tableName,row){

		return $q(function(resolve,reject){

			store.open().then(function(res){

				if(row!=null){

					row.sessionId = appParams.params.onlineDbStore.sessionId;

					var operation_code;

					/*row._rs = 'I';

					if(row[appParams.params.primarykey[tableName]]){
						row._rs === 'U';
					}*/

					row._rs = row.remoteAction;

					if(row._rs === 'I'){
						operation_code = '/insert';
					}
					else if(row._rs === 'U'){
						operation_code = '/update';
					}
					else if(row._rs === 'D'){
						operation_code = '/delete';
					}



					$http.post(appParams.params.onlineDbStore.api+'/'+tableName+operation_code,row).then(
							function(res){
								if(res.data.status==='ERROR'){
									reject(res.data);
								}
								else {
									console.log('ONLINEDBSTORE | SAVE ROW | Success | '+tableName);				
									console.log(JSON.stringify(res.data));
									resolve(res.data);
								}
							}
						);

					
				}
				else {
					console.log('ONLINEDBSTORE | SAVE ROW | Error | '+tableName);
					reject('Error');
				}


			},function(err){
				console.log('ONLINEDBSTORE | SAVE ROW | Error | '+tableName);
				reject('Error');
			});

		});
	};

	store.saveAll = function(tableName,rows){

		return $q(function(resolve,reject){

			store.open().then(function(res){

					var insertRows = [];
					var updateRows = [];

					//params.primarykey

					angular.forEach(rows,function(val){
						val.sessionId = appParams.params.onlineDbStore.sessionId;

						if(val.remoteAction==='U')
						{	
							updateRows.push(val);
						}
						else if((val.remoteAction==='I')) {
							insertRows.push(val);
						}
						else
						{
							console.log(' WARNING | ROW WITH INVALID STATUS | WILL NOT BE SAVED ');
						}
					});

					var prArr = [];

					prArr.push($http.post(appParams.params.onlineDbStore.api+'/'+tableName+'/update',updateRows));
					prArr.push($http.post(appParams.params.onlineDbStore.api+'/'+tableName+'/insert',insertRows));

					Promise.all(prArr).then(function(res){
						resolve(res);
					}).catch(function(err){
						reject(err);
					});

				/*	$http.post(appParams.params.onlineDbStore.api+'/'+tableName+'/update',rows).then(
							function(res){
								if(res.data.status==='ERROR'){
									reject(res.data);
								}
								else {
									console.log('ONLINEDBSTORE | SAVE ROW | Success ');				
									console.log(JSON.stringify(res.data));
									resolve(res.data);
								}
							}
						);		*/		


				
			},function(err){
				console.log('ONLINEDBSTORE | SAVE ALL | Error');
				reject(err);
			});

		});


	};

});

app.service('dbStore',function($q,offlineDbStore,onlineDbStore,online,appParams){
	/*	if ONLINE
			Check pending changes in localDB
			Commit pending changes in remoteDB
			Commit current change in remoteDB
		else
			Commit current change to localDB
	*/
	var store = this;

	this.mode = 'offline';

	/* WE MIGHT NOT NEED THIS | CHECK AGAIN | HAVE SPECIFIC IMPLEMENTATIONS DO IT */

	this.open = function(){
		return $q(function(resolve,reject){
			online.getStatus().then(function(response){
				console.log('DBSTORE OPEN RESPONSE | '+response);

				console.log(' DB | '+appParams.params.dbName);
				console.log(' DB Version | '+appParams.params.dbVersion);
				console.log(' DB Tables | '+ JSON.stringify(appParams.params.dbTables));

				console.log(' API URL | '+appParams.params.onlineDbStore.api);
				console.log(' API Username | '+appParams.params.onlineDbStore.api);
				console.log(' API Password | '+appParams.params.onlineDbStore.api);

				
				/*
					INDEXED DB SETUP | WILL BE EXECUTED WHEN THE APP IS OFFLINE

					OPEN THE DATABASE
					LOOK FOR THE OBJECT STORE
					CREATE IF DOESNT EXIST
				*/

				online.getStatus().then(function(res){
					if(res==='online'){

						this.mode='online';

						onlineDbStore.open().then(function(res){
							console.log('DBSTORE | Connected to REMOTE server | '+ JSON.stringify(res));
							resolve('online');
						},function(err){
							console.log('DBSTORE | Could not connect to REMOTE server '+err);
							reject('online');
						});

					}
					else if(res==='offline'){

						this.mode='offline';

						offlineDbStore.open().then(function(res){
							console.log('DBSTORE | opened the offlineDbStore | '+res);
							resolve('offline');
						},function(err){
							console.log('DBSTORE | ERROR while opening the offlineDbStore | '+err);
							reject('offline');
						});

					}
				});
			

			},function(err){
				console.log('DBSTORE OPEN ERROR | '+err);
				reject('offline');
			});
		});
	};

	this.queryOffline = function(tableName,limit,params){
		return $q(function(resolve,reject){
			offlineDbStore.query(tableName,limit,params).then(function(res){
				resolve(res);
			},function(err){
				reject(err);
			});
		});
	};

	this.query = function(tableName,limit,params){
		return $q(function(resolve,reject){

/*			if(!params){
				 params = {
					params: {
						executeCountSql: 'N'
					},
				};
			}*/

			online.getStatus().then(function(res){

				if(res==='online'){
					/* ONLINE */
					this.mode='online';
					onlineDbStore.query(tableName,limit,params).then(function(res){
						resolve(res);
					},function(err){
						reject(err);
					});
				}
				else if(res=='offline'){
					/* OFFLINE */
					this.mode='offline';
					 offlineDbStore.query(tableName,limit,params).then(function(res){
						resolve(res);
					},function(err){
						reject(err);
					});
				}

			},function(err){
				console.log('DBSTORE QUERY ERROR | '+err);
				reject('error');
			});

		});
	};

	this.loadOfflineData = function(){
		/* load all the offline data */

		return $q(function(resolve,reject){
			offlineDbStore.query('KOMSRHeader',0,{}).then(function(res){

				
				appParams.params.offline.srHeaderList = res;
				//appParams.params.offline.srHeaderList.push(res);

				if(res.length){
					var prArr = [];
					/* load the Lines */
					offlineDbStore.query('KOMSRLines',0,{}).then(function(res){
						appParams.params.offline.srLineList = res;
						//appParams.params.offline.srLineList.push(res);
						console.log('SUCCESS | LOAD OFFLINE DATA | KOMSRLines');
					},function(err){
						console.log('ERROR | LOAD OFFLINE DATA | KOMSRLines');
					});
					/* load the Notes */
					offlineDbStore.query('KOMSRNotes',0,{}).then(function(res){
						appParams.params.offline.srNoteList = res;
						//appParams.params.offline.srNoteList.push(res);
						console.log('SUCCESS | LOAD OFFLINE DATA | KOMSRNotes');
					},function(err){
						console.log('ERROR | LOAD OFFLINE DATA | KOMSRNotes');
					});;
					/* load the TravelLog */
					offlineDbStore.query('KOMSRTravelLog',0,{}).then(function(res){
						appParams.params.offline.srTravelLogList = res;
						//appParams.params.offline.srTravelLogList.push(res);
						console.log('SUCCESS | LOAD OFFLINE DATA | KOMSRTravelLog');
					},function(err){

					});

					Promise.all(prArr).then(function(res){
						resolve('success');
					}).catch(function(err){
						reject(err);
					})
				}
				else {
					resolve('success');
				}

			},function(err){
				reject(err);
			});

		});


	};

	

	this.saveRow = function(tablename,row){
		/* delegate as per the status of connectivity */
		return $q(function(resolve,reject){

			online.getStatus().then(function(res){
				row.lastModifiedDate = new Date();
				if(res==='online'){
					this.mode='online';
					return onlineDbStore.saveRow(tablename,row);
				}
				else if(res=='offline'){
					this.mode='offline';
					return offlineDbStore.saveRow(tablename,row);
				}

			},function(err){
				console.log('DBSTORE SAVEROW ERROR | '+err);
				reject('offline');
			});	

			

		});
		
	};

	this.saveOffline = function(srId){
		/*
			GET THE INFO FROM ONLINE STORE
			STORE IT IN LOCAL STORE
			LOCAL STORE ENTRY = [ONLINE_STORE]+[FLAG]+[LAST MODIFIED DATE]
		*/

		return $q(function(resolve,reject){
			online.getStatus().then(function(res){
				if(res==='online'){

				/*	if(!srId){
						srId = 2;
					} */

				/*this.mode='online';
				var queryParams = {
					params: {
						executeCountSql: 'N'
					},
				};

				queryParams.whereClause = "#srId# = ?";
	          	queryParams.whereClauseParams = [srId];*/

	          	 queryParams = {
            		"srId": srId
        		}



				/*if(tableName!='KOMSRHeader'){

					queryParams.whereClause = "#srId# = ?";
          			queryParams.whereClauseParams = [appParams.params.viewSr.srId];
				}*/

					/*
						Get the SR HEADER
						Get the SR LINES
						Get the SR Travel Info
						Get the SR Notes
					*/

					var srHeader;
					var srLines;
					var srTravelLog;
					var srNotes;

					onlineDbStore.query('KOMSRHeader',0,queryParams).then(function(res){
						console.log('Header Loaded | ');

						if(res.length>0 && res[0].srId){

							srHeader = res;
							console.log('DBSTORE | SAVE OFFLINE | Header | ');
							

							onlineDbStore.query('KOMSRLines',0,queryParams).then(function(res){

								srLines = res;
								console.log('DBSTORE | SAVE OFFLINE | Lines | ');

								onlineDbStore.query('KOMSRTravelLog',0,queryParams).then(function(res){

									srTravelLog = res;
									console.log('DBSTORE | SAVE OFFLINE | Travel | ');

									onlineDbStore.query('KOMSRNotes',0,queryParams).then(function(res){

										srNotes = res;
										console.log('DBSTORE | SAVE OFFLINE | Notes | ');

										
										/* MAKE A CALL TO OFFLINE DB */
										angular.forEach(srHeader,function(val){
												val.remoteAction = 'U';
										});

										offlineDbStore.saveAll('KOMSRHeader',srHeader).then(function(res){
											var prArr = [];


											angular.forEach(srLines,function(val){
												val.remoteAction = 'U';
											});
											angular.forEach(srTravelLog,function(val){
												val.remoteAction = 'U';
											});
											angular.forEach(srNotes,function(val){
												val.remoteAction = 'U';
											});


											if(srLines.length>0)
												prArr.push(offlineDbStore.saveAll('KOMSRLines',srLines));
											if(srTravelLog.length>0)
												prArr.push(offlineDbStore.saveAll('KOMSRTravelLog',srTravelLog));
											if(srNotes.length>0)
												prArr.push(offlineDbStore.saveAll('KOMSRNotes',srNotes));

											Promise.all(prArr).then(function(res){
												resolve('success');
											}).catch(function(err){
												reject(err);
											});	
											
										},function(err){
											reject(err);
										});


									},function(err){
										reject(err);
									})

								},function(err){
									reject(err);
								})

							},function(err){
								reject(err);
							});
						}
						else{
							reject(err);
						}
					},function(err){
						reject(err);
					})

				}
				else {
					this.mode='offline';
					console.log('DBSTORE | SAVE OFFLINE | Could not save as the app is offline');
					reject('error');
				}
			},function(err){
					console.log('DBSTORE | SAVE OFFLINE | Could not get the connectivity info');
					reject('error');
			});
		});

	};

	this.clearOfflineStore = function(){
		return $q(function(resolve,reject){
			offlineDbStore.clearAll().then(function(res){
				resolve('sucess');
			},function(err){
				reject('error');
			});
		});
	};

	this.setUpofflineStore = function(){
		return $q(function(resolve,reject){
			offlineDbStore.open().then(function(res){
				resolve(res);
			},function(err){
				reject(err);
			});
		})
	};




	this.sync = function(){

		/*
			TAKE THE DATA FROM LOCAL STORE
			SAVE IT TO THE ONLINE STORE
		*/
		return $q(function(resolve,reject){
			online.getStatus().then(function(res){

				/* DO ONLY ONLINE*/
				/* fetch all the offline services & update them in the db */
				var listLines;
				var listTravelInfo;
				var listNotes;


				if(res==='offline'){
					this.mode='offline';
					reject('Cannot sync as the app is offline');
				}
				else if (res==='online'){
					   this.mode='online';
						offlineDbStore.query('KOMSRHeader',0,null).then(function(res){
							console.log('Offline Data | '+JSON.stringify(res));

							onlineDbStore.saveAll('KOMSRHeader',res).then(function(res){

								offlineDbStore.query('KOMSRLines',0,null).then(function(res){

									listLines = res;

									offlineDbStore.query('KOMSRTravelLog',0,null).then(function(res){

										listTravelInfo = res;

										offlineDbStore.query('KOMSRNotes',0,null).then(function(res){

											listNotes = res;

											//resolve('sucess');

											var prSync = [];
											/**/

											/* DELETE LINES */


											onlineDbStore.saveAll('KOMSRLines',listLines).then(function(res){

													console.log('SYNC | KOMSRLINES | Update Remote Successful');

													angular.forEach(listLines,function(val){
														val.remoteAction='U';
													});

													offlineDbStore.saveAll('KOMSRLines',listLines).then(function(res){

														console.log('SYNC | KOMSRLINES | Update Local Successful');

														onlineDbStore.saveAll('KOMSRTravelLog',listTravelInfo).then(function(res){

															console.log('SYNC | KOMSRTravelLog | Update Remote Successful');

															angular.forEach(listTravelInfo,function(val){
																val.remoteAction='U';
															});

															offlineDbStore.saveAll('KOMSRTravelLog',listTravelInfo).then(function(res){

																	console.log('SYNC | KOMSRTravelLog | Update Local Successful');

																	onlineDbStore.saveAll('KOMSRNotes',listNotes).then(function(res){

																		console.log('SYNC | KOMSRNotes | Update Remote Successful');

																		angular.forEach(listNotes,function(val){
																			val.remoteAction='U';
																		});		

																		offlineDbStore.saveAll('KOMSRNotes',listNotes).then(function(res){

																			console.log('SYNC | KOMSRNotes | Update Local Successful');
																			resolve('success');


																		},function(err){
																			console.log('SYNC | Could not update the KOMSRNotes Locally | '+err);
																			reject(err);		
																		});
																														
																	},function(err){
																		console.log('SYNC | Could not Remote update the KOMSRNotes | '+err);
																		reject(err);
																	});

															},function(err){
																console.log('SYNC | Could not update the KOMSRTravelLog Locally | '+err);
																reject(err);		
															});
															

														},function(err){
															console.log('SYNC | Could not Remote update the KOMSRTravelLog | '+err);
															reject(err);
														});


													},function(err){
														console.log('SYNC | Could not  update the KOMSRLINES Locally | '+err);
														reject(err);		
													});

											},function(err){
												console.log('SYNC | Could not remote update the KOMSRLINES | '+err);
												reject(err);
											});

											


										},function(err){
											console.log('SYNC | ERROR | '+JSON.stringify(err));
											reject(err);
										});

									},function(err){
										console.log('SYNC | ERROR | '+JSON.stringify(err));
										reject(err);
									});

								},function(err){
									console.log('SYNC | ERROR | '+JSON.stringify(err));
									reject(err);
								});

								/*console.log('SYNC | SUCCESS | '+JSON.stringify(res));
								resolve('success');*/

							},function(err){
								console.log('SYNC | ERROR | '+JSON.stringify(err));
								reject(err);
							});

							
						},function(err){
							reject(err);
						});					

				}
				else {
					reject('Invalid Internet Status');
				}



			},function(err){
				console.log('SYNC | ERROR | '+err);
				reject(err);
			});
		});

	};

	this.saveAll = function(){

	};


});