(function() {
    "use strict";
    angular.module('app').directive('settingsItemLane',[ function(){
            return {
                restrict: 'E',
                scope: {
                    index: '=',
                    lane: '=',
                    onLaneChange: '&',
                    onLaneRemove: '&'
                },
                replace: true,
                templateUrl: 'app/organizations/partials/settings-item-lane.html',
                link: function($scope, element, attrs) {
                    $scope.inEdit = false;

                    $scope.newValues = {
                        newLabel: $scope.lane.label
                    };

                    $scope.toggleEdit = function(){
                        $scope.inEdit = !$scope.inEdit;
                        if(!$scope.inEdit){
                            var newLane = Object.assign($scope.lane, {label: $scope.newValues.newLabel});

                            $scope.onLaneChange({newLane: newLane, i: $scope.index})
                        }
                    };

                    $scope.remove = function(){
                        $scope.onLaneRemove({i: $scope.index});
                    };
                }
            };
        }
    ]);
}());