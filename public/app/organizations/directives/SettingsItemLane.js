(function() {
    "use strict";
    angular.module('app').directive('settingsItemLane',[
        'itemService',
        '$state',
        function(itemService, $state){
            return {
                restrict: 'E',
                scope: {
                    lane: '='
                },
                replace: true,
                templateUrl: 'app/organizations/partials/settings-item-lane.html',
                link: function($scope, element, attrs) {
                    $scope.removeLane = function(lane){
                        console.log(lane);
                    }
                }
            };
        }
    ]);
}());