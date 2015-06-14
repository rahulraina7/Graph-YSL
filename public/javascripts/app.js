// MODULE
var angularApp = angular.module('angularApp', ['ngRoute','angular-loading-bar', 'ngAnimate']);
var loginApp  =  angular.module('loginApp',['ngRoute','angular-loading-bar', 'ngAnimate']);
angularApp.config(function($routeProvider){
     
    $routeProvider
    
    .when('/', {
        templateUrl:'/main.html',
        controller:'mainController'
    })
          
    .when('/app',{
        templateUrl:'/app.html',
        controller:'appController'
        })
    
    .when('/learnmore',{
        templateUrl:'/learnmore.html',
        controller:'learnController'
    })
});


angularApp.service('myService',function(){
    var self = this;
    this.name = 'Rahul Raina';
    this.nameLength = function(){
        return self.name.length;
    };
    

});


// CONTROLLERS
angularApp.controller('mainController', ['$scope','$routeParams','$log','myService', function ($scope,$routeParams,$log,myService) {
    
    $scope.name = myService.name;
    
    $scope.$watch('name',function(){
        myService.name = $scope.name;    
    });
    
    
    
    
}]);
angularApp.controller('secondController', ['$scope','$routeParams','$log','myService', function ($scope,$routeParams,$log,myService) {
    $scope.num = $routeParams.num || 1;
    $scope.name = myService.name;
    
    $scope.$watch('name',function(){
        myService.name = $scope.name;    
    });
    
    
    $log.info(myService.name);
    $log.info(myService.nameLength());
}]);


angularApp.controller('learnController', ['$scope','$routeParams','$log','myService', function ($scope,$routeParams,$log,myService) {
    $scope.num = $routeParams.num || 1;
    $scope.name = myService.name;
    
    $scope.$watch('name',function(){
        myService.name = $scope.name;    
    });
    
    
    $log.info(myService.name);
    $log.info(myService.nameLength());
}]);

angularApp.controller('appController', ['$scope','$routeParams','$log','myService', function ($scope,$routeParams,$log,myService) {
    
}]);



angularApp.controller('searchController', ['$scope','$routeParams','$log','$http','myService', function ($scope,$routeParams,$log,$http,myService) {
    
    $scope.runQuery =  function () {
        var searchText ="";
        $scope.table_body = [];
        $log.info($scope.searchQuery);
        if($scope.searchQuery.trim() != ""){
            var searchText = {msg : $scope.searchQuery};
            $http.post('/api/get',searchText)
                .success(function(data) {
                    $log.info("api call success ..!!");
                    $log.info(data);
                    $scope.table_headers = data.result;
                    $scope.result = JSON.stringify(data, null, 2);
                    angular.element('#closer').trigger('click');
                })
                .error(function(data){
                    $log.info("api error..!! :(");
                });
            $scope.searchQuery='';
        }

    }
}]);




angularApp.controller('loginController',['$scope','$log','$http', function ($scope,$log,$http) {
    $scope.Login = "Login";
    $scope.doLogin =  function () {
        // do a yodlee cobrand login here..!!
        $scope.Login = "Logging in Yodlee..";
        $log.info('Doing Cobrand login');
        $http.get('/api/login')
            .success(function(data) {
                $scope.Login = "Welcome";
                $scope.loggedin = true;
                $log.info('Login Success');
                $log.info(data);
            })
            .error(function(data){
                $log.error('Login error :(');
                $log.error(data);
            });

    };
}]);
