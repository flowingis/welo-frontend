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

                    $scope.toggleEdit = function(){
                        $scope.inEdit = !$scope.inEdit;
                    };

                    $scope.remove = function(){
                        $scope.onLaneRemove({i: $scope.index});
                    }
                }
            };
        }
    ]);
}());