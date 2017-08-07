var app = angular.module('offline', []);

app.service('internet', function($rootScope, $http, $q){
	this.getStatus = function(){
		return $q(function(resolve, reject){
			var url = $rootScope.remote.offlineTestUrl + "?_=" + new Date().getTime();
			$http.get(url ).then(function(response){
				resolve("online");
			}, function(error){
				resolve("offline");
			});
		});
	}
});


app.service('localDb', function($q, $rootScope) {
	
	var db, request, dbName, dbVersion, objects;
		
	this.getObjects = function(){
		return objects;
	}
	this.getPK = function(table){
		for(var i=0; i < objects.length; i++){
			if(objects[i].name == table){
				return objects[i].primarykey;
			}
		}
	}
	var localDb = this;

	localDb.generateGUID = function(){
		function S4() {
		    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
		}
		var guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
		return guid;
	}

	localDb.open = function() {
		return $q(function(resolve, reject) {
			if(db != null){
				resolve("sucess");
				return;
			}

			dbName = $rootScope.localDb.schema;
			dbVersion = $rootScope.localDb.version;
			objects = $rootScope.localDb.tables;

			window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
			window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
			if (!window.indexedDB) {
			   window.alert("Your browser doesn't support a stable version of IndexedDB.");
			   reject("Your browser doesn't support a stable version of IndexedDB.");
			   return;
			}
			
			request = window.indexedDB.open(dbName, dbVersion);
			request.onerror = function(event) {
				reject("Error while opening db!");
			};
			request.onsuccess = function(event) {
				db = request.result;
				resolve("sucess");
			};

			request.onupgradeneeded = function(event) {
				var db = event.target.result;
				var object;
				for(var i =0; i < objects.length; i++){
					object = objects[i];
					db.createObjectStore(object.name, {
						keyPath : object.primarykey,
						//autoIncrement : object.autoIncrement
					});
				}
				resolve("sucess");
			}
		});
	}

	localDb.save = function(table, data, status, _rs){
		return $q(function(resolve, reject) {
		   if(!db){
				reject("Error: DB is not opened!");
				return;
			}
			if(data.length < 1) resolve("Nothing to update!");
		   var transaction = db.transaction([table],"readwrite");
		   transaction.onerror = function(event) {
	      	 reject("Error while update!");
	       }; 
	       transaction.oncomplete = function(event) {}
		   var objectStore = transaction.objectStore(table);
		   
		   var i = 0;
  		   putNext();
	         function putNext() {
	             if (i< data.length) {
	            	 var row = data[i];
		    		   row._rs = "update";
		    		   if(_rs) row._rs = _rs;
		    		   //row.status = "local";
		    		   if(status) row.status = status;
	            	 objectStore.put(row).onsuccess = putNext;
	                 ++i;
	             } else {
	            	 resolve("success");
	             }
	         } 
          resolve("success");
		});
	}

	localDb.deleteAll = function(table, data){
		return $q(function(resolve, reject) {
		   if(!db){
				reject("Error: DB is not opened!");
				return;
			}
		   if(data.length < 1) resolve("Nothing to delete");
		   resolve([]);
		});
	};

	localDb.erase = function(table){
		return $q(function(resolve, reject) {
			var transaction = db.transaction([table], "readwrite");
			  transaction.oncomplete = function(event) {
			  };
			  transaction.onerror = function(event) {
				  resolve("Error while erase!");
				  return;
			  };
			  var objectStore = transaction.objectStore(table);
			  var objectStoreRequest = objectStore.clear();
			  objectStoreRequest.onsuccess = function(event) {
				  resolve("success"); 
			  };
		});
	};

	localDb.eraseInsert = function(table, data, status){
		return $q(function(resolve, reject) {
			var transaction = db.transaction([table], "readwrite");
			  transaction.oncomplete = function(event) {
			  };
			  transaction.onerror = function(event) {
				  resolve("Error while erase!");
				  return;
			  };
			  var objectStore = transaction.objectStore(table);
			  var objectStoreRequest = objectStore.clear();
			  objectStoreRequest.onsuccess = function(event) {
				  localDb.insertAll(table, data, status).then(function(){
					resolve("success");  
				  }, function(error){
					  reject(error);
				  });
			  };
		});
	};

	localDb.queryById = function(table, id){
		return $q(function(resolve, reject) {
			 var transaction = db.transaction([table]);
			  var objectStore = transaction.objectStore(table);
			   var request = objectStore.get(id);
			   request.onerror = function(event) {
				   reject("Error while data retrieve!");
			   };
			   request.onsuccess = function(event) {
			      if(request.result) {
			    	  resolve(request.result);
			    	  return;
			      }
			      resolve([]);
			   };
			
		});
	}
	
	localDb.query = function(table) {
		return $q(function(resolve, reject) {
			if(!db){
				reject("Error: DB is not opened!");
				return;
			} 
			 var result = [];
			 var transaction = db.transaction(table);
	         transaction.oncomplete = function(event) {
	         };
	         transaction.onerror = function(event) {
	        	 reject("Error while query!");
	         };
		   var objectStore = transaction.objectStore(table);
		   objectStore.openCursor().onsuccess = function(event) {
		      var cursor = event.target.result;
		      if (cursor) {
		    	  var data = {};
		    	  var d = cursor.value;
		    	  for (var key in d) {
		        	   if (d.hasOwnProperty(key)) {
		        		   data[key] = d[key];
		        	   }
		           }
		    	  result.push(data);
		         cursor.continue();
		      }else {
		    	  resolve(result);
		      }
		   };
		});
	}
});

app.service('remote', function($http, $rootScope, $q, localDb){
	var remote = this; 
	remote.signin = function(u, p){
		return $q(function(resolve, reject){
			var url = $rootScope.remote.apiEndPoint + "/api/signin";
			$http.post(url, {username: u, password: p}).then(function(response){
				if(response.data.status === "ERROR"){
					$rootScope.sessionId = null;
					reject("InvalidCredentails");
				}else{
					$rootScope.sessionId = response.data.sessionId;
					resolve(response.data.sessionId);
				}
			});
		});
	};
	remote.query = function(table, params){
		return $q(function(resolve, reject){
			if(!$rootScope.sessionId){
				reject("InvalidSession");
				return;
			}
			if(!params) params = {};
			params["params"] = { 
	 			"executeCountSql": "N"
				};
			params["sessionId"] = $rootScope.sessionId;
			var url = $rootScope.remote.apiEndPoint + "/api/"+ table;
			$http.post(url, params ).then(function(response){
				if(response.data.status === "ERROR"){
					reject(response.data);
				}else{
                   var data = response.data.data;
                   for(var i = 0; i < data.length; i++){
                      var d = data[i];
                       for(key in d){
                          if(key.startsWith("@")){
                            delete data[i][key];
                          }
                         delete data[i]["_rs"];
                       }
                   }
					resolve(data);
				}
			});
			
		});
	}
	remote.insertAll = function(table, data){
		return $q(function(resolve, reject){
			if(!$rootScope.sessionId){
				reject("InvalidSession");
				return;
			}
			if(data.length < 1) resolve([]);
			var url = $rootScope.remote.apiEndPoint + "/api/" + table + "/insert";
			for(var i = 0; i < data.length; i++){
				data[i].sessionId = $rootScope.sessionId;
              	if(!data[i].id) data[i].id = localDb.generateGUID();
			}
			$http.post(url, data ).then(function(response){
				if(response.data.status === "ERROR"){
					reject(response.data);
				}else{
					var data = response.data;
					for(var i =0; i < data.length; i++){
						delete data[i]["_sql"];
						delete data[i]["_elapsed"];
						delete data[i]["_ds"];
						delete data[i]["_rs"];
					}
					resolve(data);
				}
			});
		});
	}
	remote.updateAll = function(table, data){
		return $q(function(resolve, reject){
			if(!$rootScope.sessionId){
				reject("InvalidSession");
				return;
			}
			if(data.length < 1) {
				resolve([]);
				return;
			}
			var url = $rootScope.remote.apiEndPoint + "/api/" + table + "/update";
			for(var i = 0; i < data.length; i++){
				data[i].sessionId = $rootScope.sessionId;
			}
			$http.post(url, data ).then(function(response){
				if(response.data.status === "ERROR"){
					reject(response.data);
				}else{
					var data = response.data;
					for(var i =0; i < data.length; i++){
						delete data[i]["_sql"];
						delete data[i]["_elapsed"];
						delete data[i]["_ds"];
						delete data[i]["_rs"];
					}
					resolve(data);
				}
			});
		});
	};
	remote.deleteAll = function(table, data){
		return $q(function(resolve, reject){
			if(!$rootScope.sessionId){
				reject("InvalidSession");
				return;
			}
			if(data.length < 1) resolve([]);
			resolve([]);
		});
	};
});

app.service('$db', function(localDb, remote, $q, $rootScope, internet){
	var count = 0;
	var db = this;
	db.configure =  function(details){
		for(key in details){
			$rootScope[key] = details[key];
		}
	};
	db.signin = function(username, password){
		return remote.signin(username, password);
	};
	db.queryById = function(table, id){
		return $q(function(resolve, reject) {
			if(!id) reject("No Id found!");
			localDb.open().then(function(response){
				localDb.queryById(table, id).then(function(result){
					resolve(result);
				}, function(error){
					reject(error);
				});
			}, function(error){
				reject(error);
			});
		});
	}
	db.remoteQuery = function(table, params){
		return remote.query(table, params);
	}
	db.saveOffline = function(table, data){
		return $q(function(resolve, reject) {
			localDb.open().then(function(response){
				localDb.save(table, data, "local").then(function(){
					resolve(data);
				}, function(error){reject(error)});
			}, function(error){reject(error)});
		});
	}
	db.localQuery = function(table, type){
		var _filter = null;
		var _sort = null;
		var _offset = 0;
		var _limit = 20;
		
		function proceessLocalData(data){
			 var d = data;
			 if(_filter && typeof _filter === 'function' && data.length > 0){
				 d = [];
				 for(var i=0; i < data.length; i++){
					 if(_filter(data[i])){
						 d.push(data[i]);
					 }
				 }
			 }
			 if(_sort && d.length > 0){
					var column = _sort.column;
					var type = _sort.type;
					var dir = _sort.dir;
					if(!dir && (dir !== "desc" || dir !== "asc" ) ) dir = "asc";
					if(!type && (type !== "string" || type !== "number" || type !== "date"))
						type = "string";
					if(type === "string"){
						d.sort(function(a, b) {
							var entry1 = a[column] + "";
							var entry2 = b[column] + "";
							entry1 = entry1.toLowerCase();
							entry2 = entry2.toLowerCase();
							if(dir === "desc"){
								if (entry1 > entry2) return -1;
							    if (entry1 < entry2) return 1;
							}else{
								if (entry1 < entry2) return -1;
							    if (entry1 > entry2) return 1;
							}
						    return 0;
						});
					}else if(type === "number"){
						d.sort(function(a, b) {
							if(dir === "desc"){
								return a[column] - b[column];
							}else{
								return b[column] - a[column];
							}
						});
					}else{
						d.sort(function(a, b) {
							var date1 = a[column];
							var date2 = b[column];
							if(typeof date1 === "string"){
								date1 = new Date(date1);
							}
							if(typeof date2 === "string"){
								date2 = new Date(date2);
							}
							if(dir === "desc"){
							    return date2 - date1;
							}else{
							    return date1 - date2;
							}
						});
					}
				 }
			 if(_limit > d.length) _limit = d.length;
			 d = d.slice(_offset, _limit);
			 return d;
		}
		function execute(){
			return $q(function(resolve, reject) {
				localDb.open().then(function(response){
					localDb.query(table).then(function(result){
						resolve(proceessLocalData(result));
					}, function(error){reject(error)});
				});
			});
		}
       function sort(obj){
			_sort = obj;
			return {execute}
		}
        function limit(offset, limit){
			_offset = offset;
			_limit = limit;
			return {sort, execute};
		}
		function filter(fn){
			_filter = fn;
			return {limit, sort, execute}
		}
		return {
			filter, sort, limit, execute
		};
	};
	db.save = function(table, data){
		return $q(function(resolve, reject) {
			localDb.open().then(function(response){
				var rows = data;
				if(!angular.isArray(data)){
					rows = [];
					rows.push(data);
				}
				internet.getStatus().then(function(status){
					 if(status === "online"){
						  if(data.status === "local"){
							  remote.updateAll(table, rows).then(function(result){
									localDb.save(table, result, "local").then(function(){
										resolve(data);
									}, function(error){reject(error)});
								},function(error){
									reject(error);
								});
						  }else{
							  remote.updateAll(table, rows).then(function(result){
								  resolve(data);
							  }, function(error){reject(error)}); 
						  }
						}else{
							localDb.save(table, rows, "local").then(function(){
								resolve(data);
							}, function(error){reject(error)});
						}
				});
			}, function(error){reject(error)});
		});
	}
	var tables = [];
	db.clearLocal = function(data){
		return $q(function(resolve, reject) {
			localDb.open().then(function(response){
				count = 0;
				if(!data){
					tables = localDb.getObjects();
				}else{
					if(!angular.isArray(data)){
						tables = [];
						tables.push(data);
					}else{
						tables = data;
					}
				}
				localClearAll(function(success){
					resolve(success);
				}, function(error){
					reject(error);
				});
			}, function(error){reject(error)});
		});
	}
	function localClearAll(success, failure){
		var total = tables.length-1;
		 if (count > total) {
			 return success("Everything cleared!");
		  }
		 var table = tables[count];
		 localDb.erase(table.name).then(function(){
			 count++;
			 localClearAll(success, failure);
		 }, function(){
			 
		 });
	}
	db.sync = function(){
		return $q(function(resolve, reject) {
			internet.getStatus().then(function(status){
				if(status === "online"){
					count = 0;
					tables = localDb.getObjects();
					forceSync(function(success){
						resolve(success);
					}, function(error){
						reject(error);
					});
				}else{
					reject("offline");
				}
			});
		});
	}
	function forceSync(success, failure){
		var total = tables.length-1;
		 if (count > total) {
			 return success("Everything is upto date!");
		  }
		 var table = tables[count];
		 var _f = function(data){
			 if(data.status === "local") return true;
			 return false;
		 };
		db.localQuery(table.name).filter(_f).execute().then(function(result){
			remote.updateAll(table.name, result).then(function(result){
				localDb.save(table.name, result, "remote").then(function(){
					count++;
					forceSync(success, failure);
				}, function(error){failure(error);});
					  /*remote.query(table.name, table.remoteDataConfigs).then(function(response){
						  localDb.eraseInsert(table.name, response, "remote").then(function(response){
							   count++;
				  				forceSync(success, failure);
						  }, function(error){
							  failure(error);
						  });
						}, function(error){
							failure(error);
						});*/
					}, function(error){
						 failure(error);
					}); 
			},function(error){
				 failure(error);
		});
	}
});

app.service('dataStore',function($q,$rootScope,internet,localDb,remote,$db){
	var store = this;
});
/*
 
 localDb.insertAll = function(table, data, status, _rs){
		return $q(function(resolve, reject) {
			if(!db){
				reject("Error: DB is not opened!");
				return;
			}
			if(data.length < 1) resolve("Nothing to delete!");
			 var transaction = db.transaction([table],"readwrite");
             transaction.oncomplete = function(event) {
            	 console.log("transaction.oncomplete");
             };
             transaction.onerror = function(event) {
            	 reject("Error while insert!");
            	 return;
             };
  		   var objectStore = transaction.objectStore(table);
           var i = 0;
  		   addNext();
	         function addNext() {
	             if (i< data.length) {
	            	 var row = data[i];
	                 if(!row.id) row.id = localDb.generateGUID();
	            	 row._rs = "insert";
	            	 if(_rs) row._rs = _rs;
	            	 row.status = "local";
		    		 if(status) row.status = status;
	            	 objectStore.add(row).onsuccess = addNext;
	                 ++i;
	             } else {
	            	 resolve("Successfully inserted!");
	             }
	         }  
		});
	}
	
	if(operation === "insert"){
					var rows = data;
					if(!angular.isArray(data)){
						rows = [];
						rows.push(data);
					}
					internet.getStatus().then(function(status){
						if(status === "online"){
							remote.insertAll(table, rows, "remote", "update").then(function(result){
								localDb.insertAll(table, result, "remote", "update").then(function(response){
									resolve("success");
								}, function(error){
									reject(error);
								});
							},function(error){
								reject(error);
							});
						}else{
							localDb.insertAll(table, rows, "local", "insert").then(function(response){
								resolve("offline");
							}, function(error){
								reject(error);
							});
						}
					});
				}else
				
				
	function postRemote(table, data, isForceSync){
		return $q(function(resolve, reject) {
			if(data.length < 1) resolve([]);
				var insertList = [], updateList = [], deleteList = [];
				for(var i=0; i < data.length; i++){
					if(data[i]._rs === "insert"){
						insertList.push(data[i]);
					}else if(data[i]._rs === "update"){
						updateList.push(data[i]);
					}else if(data[i]._rs === "delete"){
						deleteList.push(data[i]);
					}
				}
				var result = [];
					remote.insertAll(table, insertList).then(function(response){
						remote.updateAll(table, updateList).then(function(response){
							remote.deleteAll(table, deleteList).then(function(response){
								resolve("success");
							  }, function(error){
								  reject(error);
							  });
						  }, function(error){
							  reject(error);
						  });
					  }, function(error){
						  reject(error);
					  });
				
		});
	}
 
 */