var app = angular.module('io',['ui.router','testoffline']);

app.config(function($stateProvider, $urlRouterProvider){
	$urlRouterProvider.otherwise('/');

	$stateProvider.state('home',{
		url:'/',
		templateUrl: 'app/home.html',
		controller: 'AppCtrl'
	}).state('home2',{
		url:'/home',
		template:'Home Page'
	}).state('view',{
		url:'/view/:srNumber',
		templateUrl:'app/view.html',
		controller:'viewController',
		resolve:{}
	});
}).run(function(){

});

app.controller('mainController',function($scope,$state){
   $scope.pageName = 'Main';

	$scope.checkServiceWorker = function(){

		if('serviceWorker' in navigator){
			console.log('serviceWorker Exists');
			navigator.serviceWorker.register('sw.js').then(function(reg){
				console.log('service worker registration successful!!, scope |'+reg.scope);
			},function(err){
				console.log('service worker registration failed!! | '+err);
			});
		}
		else {
			console.log('serviceWorker is not supported');
		}
	};

	//initialise Service Workers
	//$scope.checkServiceWorker();

})