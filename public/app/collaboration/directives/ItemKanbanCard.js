(function () {
    "use strict";

    angular.module('app').directive('itemKanbanCard', [
        'itemService',
        'membersDataService',
        function (itemService, membersDataService) {
            return {
                restrict: 'E',
                scope: {
                    item: '=',
                    myId: '=',
                    priorityManaged: '=',
                    myClass: '='
                },
                replace: true,
                templateUrl: 'app/collaboration/partials/item-kanban-card.html',
                link: function ($scope, element, attrs) {

                    $scope.ITEM_STATUS = itemService.ITEM_STATUS;
                    $scope.picture = null;
                    $scope.position = null;
                    $scope.tooltip = "";
                    $scope.imInvolved = false;
                    $scope.isDecision = ($scope.item.decision == "true");
                    
                    if ($scope.item.status === itemService.ITEM_STATUS.IDEA) {
                        if($scope.item.author){
                            $scope.picture = $scope.item.author.picture || 'img/account.jpg';
                            $scope.ownerAuthorName = $scope.item.author.firstname + " " + $scope.item.author.lastname;
                            $scope.active = membersDataService.isActive($scope.item.author.id);
                        }
                        $scope.imInvolved = false;
                    } else if ($scope.item.status === itemService.ITEM_STATUS.OPEN) {
                        if ($scope.priorityManaged) {
                            $scope.position = $scope.item.position || "  ";
                        } else {
                            $scope.position = " ";
                        }
                        $scope.ownerAuthorName = "";
                        $scope.imInvolved = false;
                    } else {
                        var owner = itemService.getOwner($scope.item);
                        if(owner){
                            $scope.picture = owner.picture || 'img/account.jpg';
                            $scope.ownerAuthorName = owner.firstname + " " + owner.lastname;
                            $scope.active = membersDataService.isActive(owner.id);
                        }
                        $scope.imInvolved = itemService.isIn($scope.item, $scope.myId);
                    }

                    if ($scope.ownerAuthorName && !$scope.active) {
                        $scope.ownerAuthorName = $scope.ownerAuthorName + " (currently inactive)";
                    }

                    switch (true) {
                        case ($scope.imInvolved && $scope.isDecision):
                            $scope.tooltip = "It's a decision and I'm involved";
                            break;
                        case ($scope.imInvolved && !$scope.isDecision):
                            $scope.tooltip = "I'm involved";
                            break;
                        case (!$scope.imInvolved && $scope.isDecision):
                            $scope.tooltip = "It's a decision";
                            break;
                        default:
                            $scope.tooltip = "";
                            break;
                    }

                    $scope.subject = $scope.item.subject;
                    


                }
            };
        }
    ]);
}());