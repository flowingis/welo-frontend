(function() {
    "use strict";
    angular.module('app').directive('settingsLanes',[
        '$stateParams',
        '$mdDialog',
        'lanesService',
        function($stateParams, $mdDialog, lanesService){
            return {
                restrict: 'E',
                scope: {},
                replace: true,
                templateUrl: 'app/organizations/partials/settings-lanes.html',
                link: function($scope, element, attrs) {

                    $scope.lanes = []; //devo popolare questo elenco dal servizio


                    var getLanes = function() {
                        lanesService.get($stateParams.orgId).then(function(result) {
                            $scope.lanes = result;
                        });
                    };
                    

                    var getBaseLane = function(){
                        return {
                            label: ''
                        };
                    };

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