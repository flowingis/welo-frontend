(function() {
    "use strict";
    angular.module('app').directive('settingsLanes',[function(){
            return {
                restrict: 'E',
                scope: {
                    onLanesChange: '&',
                    lanes: '='
                },
                replace: true,
                templateUrl: 'app/organizations/partials/settings-lanes.html',
                link: function($scope, element, attrs) {
                    $scope.removeLane = function(index){
                        var newLanes = _.filter($scope.lanes, function(lane, i){
                            return i !== index;
                        });
                        $scope.onLanesChange({newLanes: newLanes});
                    };
                }
            };
        }
    ]);
}());