var app = angular.module('iopwa',[]);


/************************ OFFLINE ************************/
app.service('offlineDbStore',function($q,online,appParams){
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

}
/************************ ONLINE ************************/
app.service('onlineDbStore',function($q,online,appParams){
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
	}

	store.saveAll = function(tableName,rows){
		return $q(function(resolve,reject){
			resolve('success');
		});	
	}
}

/************************ SYNC ************************/
app.service('syncDbStore',function($q,offlineDbStore,onlineDbStore,conline,appParams){
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
}

/************************ STORE ************************/
app.service('dbStore',function($q,offlineDbStore,onlineDbStore,syncDbStore,online,appParams){

	var store = this;
	var syncStore = {};

	store.syncOfflineDbStore = function(tableName){
		return $q(function(resolve,reject){
			if(syncStore[tableName].length>0){
				angular.forEach(syncDbStore[tableName],function(val){


					queryParams = {
			            "srId": val.srId
			        }

			        offlineDbStore.query(tableName,0,queryParams).then(function(res){

			        },function(err){

			        });

				});
			}	
			else{
				resolve('success');	
			}		
			
		});
	};

	store.syncOnlineDbStore = function(tableName){
		return $q(function(resolve,reject){
			if(syncStore[tableName].length>0){

			}	
			else{
				resolve('success');	
			}		
		});
	};

	store.sync = function(tableName){
		return $q(function(resolve,reject){
			if(syncStore[tableName].length>0){
				syncOfflineDbStore().then(function(res){
					syncOnlineDbStore.then(function(res){
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
 						resolve(syncDbStore[tableName]);
					},function(err){
						reject(err);
					});

				}
				else if(res==='offline'){
					offlineDbStore.query(tableName,params).then(function(res){
						syncStore[tableName] = res;
						resolve(syncDbStore[tableName]);
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

			store.sync().then(function(res){
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

	store.saveAll = function(tableName,)




});	