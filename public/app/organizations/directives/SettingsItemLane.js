(function() {
    "use strict";
    angular.module('app').directive('settingsItemLane',[
        '$stateParams',
        '$mdDialog',
        'lanesService',
         function($stateParams, $mdDialog, lanesService){
            return {
                restrict: 'E',
                scope: {
                    lane: '=',
                    onUpdated: "&"
                },
                replace: true,
                templateUrl: 'app/organizations/partials/settings-item-lane.html',
                link: function($scope, element, attrs) {

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
                        var confirmMsg = "";
                        if ($scope.lane.lcitems > 0) {
                            confirmMsg =  "The lane contains some items. After deletion they will be moved to the \"Items without lane\" space. You'll then be able to edit them to assign a new lane.";
                        } else {
                            confirmMsg = "It removes all its informations and cannot be undone.";
                        }
                        var confirm = $mdDialog.confirm()
					        .title("Do you confirm you're deleting this lane?")
					        .textContent(confirmMsg)
					        .ok("YES, I DO!")
                            .cancel("NOT NOW");
                        
                            $mdDialog.show(confirm).then(function () {
                                $scope.loading = true;
                                lanesService.del($stateParams.orgId, $scope.lane.lcid).then(function() {
                                    $scope.onUpdated();
                                    $scope.loading = false;
                                }, function(error) {
                                    console.log(error);
                                    //if (error.status=="409") {
                                    //    $mdDialog.show(warning);
                                    //} 
                                });
                            });
                    };
                }
            };
        }
    ]);
}());