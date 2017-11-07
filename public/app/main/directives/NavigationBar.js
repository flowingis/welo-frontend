(function() {
    "use strict";

    angular.module('app').directive('navigationBar',['$mdMedia',
        function($mdMedia) {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: 'app/main/partials/navigationBar.html',
                link: function($scope, element, attrs) {

                    console.log($mdMedia('gt-md'));
                    console.log("ww");

                    $scope.kanbanView = $mdMedia('gt-md');

                }
            };
        }]
    );
}());
