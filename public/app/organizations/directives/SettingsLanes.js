(function() {
    "use strict";
    angular.module('app').directive('settingsLanes',[function(){
            return {
                restrict: 'E',
                scope: {
                    onLanesChange: '&',
                    onLanesSave: '&',
                    lanes: '='
                },
                replace: true,
                templateUrl: 'app/organizations/partials/settings-lanes.html',
                link: function($scope, element, attrs) {
                    $scope.updateLane = function(newLane, index){
                        var newLanes = _.map($scope.lanes, function(lane, i){
                            if(i === index){
                                return newLane;
                            }else{
                                return lane;
                            }
                        });
                        $scope.onLanesChange({newLanes: newLanes});
                    };

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