(function() {
    "use strict";

    angular.module('app').directive('navigationBar',['$mdMedia',
        function($mdMedia) {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: 'app/main/partials/navigationBar.html',
                link: function($scope, element, attrs) {

                    $scope.kanbanView = $mdMedia('gt-sm');

                }
            };
        }]
    );
}());
