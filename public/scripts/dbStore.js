var app = angular.module('testoffline');

app.service('dbStore',function($q,offlineDbStore,onlineDbStore,online,appParams){

	var data,dbData;

	this.query = function(tableName,params){

	};

	this.queryOffline = function(tableName,params){
		
	};

	this.saveRow = function(tableName,row){

	};

	this.saveAll = function(tableName,rows){

	};

	this.sync = function(tableName){
		return $q(function(resolve,reject){
			online.getStatus().then(function(res){

				if(res==='online'){

					this.queryOffline().then(function(res){

						angular.forEach(res,function(val){
							/* 
							If data exists && dbData exists
								if data.lastModifiedDate > dbData.lastModifiedDate
									fetch remoteData
									compare dbData && remoteData
									if dbData === remoteData
										update data to remoteData
									else 
										show message with option
										
							*/

						});

					},function(err){
						reject('Could not sync, '+err);
					});

				}
				else if(res==='offline'){
					reject('Could not sync as the app is offline');
				}
				else {
					reject('Invalid response from the online service');
				}

			},function(err){
				reject(err);
			});

		});
	};

}