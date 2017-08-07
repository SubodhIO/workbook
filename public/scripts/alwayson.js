var app = angular.module('alwayson');

app.service('appParams',function(){
	/* shared param values */

	this.setParams = function(key,value){
		this[key] = value;
	};

	this.getParams = function(key){
		return this[key];
	};
});

app.service('serverConnection',function($q,$http){
	var serverConnection = this;

	this.isConnected = function(){
		return $q(function(resolve,reject){
			$http.get()
		});
	};
});


app.service('onlineStore',function($q,appParams,serverConnection,appParams){

	//ABSTRACTION FOR ONLINE & OFFLINE DBS	

	/* QUERY */
	this.query = function(tableName,params){

	};

	/* SAVE | INSERT, UPDATE & DELETE */
	this.saveRow = function(tableName,row){
		this.saveAll(tableName,[row]);
	};

	this.saveAll = function(tableName,rows){

	};


});


app.service('offlineStore',function($q,appParams,serverConnection,appParams){

	//ABSTRACTION FOR ONLINE & OFFLINE DBS	

	/* QUERY */
	this.query = function(tableName,params){

	};

	/* SAVE | INSERT, UPDATE & DELETE */
	this.saveRow = function(tableName,row){
		this.saveAll(tableName,[row]);
	};

	this.saveAll = function(tableName,rows){

	};


});


app.service('dbStore',function($q,onlineStore,offlineStore,appParams,serverConnection){

	//ABSTRACTION FOR ONLINE & OFFLINE DBS	

	var dbStore = this;

	/* QUERY */
	this.query = function(tableName,params){

	};

	this.queryOffline = function(tableName,params){

	};

	/* SAVE | INSERT, UPDATE & DELETE */
	this.saveRow = function(tableName,row){
		this.saveAll(tableName,[row]);
	};

	this.saveAll = function(tableName,rows){

	};

	this.saveRowOffline = function(tableName,row){
		this.saveAllOffline(tableName,[row]);
	};

	this.saveAllOffline = function(tableName,rows){

	};

	/* SYNC */
	this.saveOfflineToOnline = function(tableList){

	};

	this.saveOnlinetoOffline = function(tableList){

	};

});

