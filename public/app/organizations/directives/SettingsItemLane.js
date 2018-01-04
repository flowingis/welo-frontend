(function() {
    "use strict";
    angular.module('app').directive('settingsItemLane',[
        '$stateParams',
        '$mdDialog',
         function($stateParams, $mdDialog){
            return {
                restrict: 'E',
                scope: {
                    lane: '=',
                    onUpdated: "&"
                },
                replace: true,
                templateUrl: 'app/organizations/partials/settings-item-lane.html',
                link: function($scope, element, attrs) {
                    $scope.inEdit = false;

                    $scope.newValues = {
                        newLabel: $scope.lane.label
                    };

                    $scope.edit = function(){
                        $mdDialog.show({
                            controller: EditLaneController,
                            controllerAs: 'dialogCtrl',
                            templateUrl: 'app/organizations/partials/edit-lane.html',
                            clickOutsideToClose: true,
                            locals: {
                                lane: $scope.lane,
                                orgId: $stateParams.orgId
                            }
                        }).then(function() {
                            $scope.onUpdated();
                        });
                    };

                    $scope.remove = function(){
                        $scope.onLaneRemove({i: $scope.index});
                    };
                }
            };
        }
    ]);
}());