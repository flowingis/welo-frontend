(function() {
    "use strict";
    angular.module('app').directive('settingsLanes',[
        '$stateParams',
        '$mdDialog',
        'lanesService',
        function($stateParams, $mdDialog, lanesService){
            return {
                restrict: 'E',
                scope: {
                    onLanesLoaded: "&"
                },
                replace: true,
                templateUrl: 'app/organizations/partials/settings-lanes.html',
                link: function($scope, element, attrs) {

                    $scope.lanes = []; //devo popolare questo elenco dal servizio


                    var getLanes = function() {
                        lanesService.get($stateParams.orgId).then(function(result) {
                            $scope.lanes = result;
                            $scope.onLanesLoaded({
                                'lanes': $scope.lanes
                            });
                        });
                    };
                    
                    $scope.lanesAdd = function(){
                        $mdDialog.show({
                            controller: NewLaneController,
                            controllerAs: 'dialogCtrl',
                            templateUrl: "app/organizations/partials/new-lane.html",
                            clickOutsideToClose: true,
                            locals: {
                                orgId: $stateParams.orgId
                            }
                        }).then(function(newLane) {
                            getLanes();
                        });
                    };

                    $scope.onUpdated = function() {
                        getLanes();
                    };

                    getLanes();
                }
            };
        }
    ]);
}());