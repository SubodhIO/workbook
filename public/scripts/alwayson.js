var app = angular.module('alwayson');

app.service('dbStore',function($q){

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

