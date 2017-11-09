(function() {
    "use strict";

    angular.module('app').directive('itemKanbanCard',[
        'itemService',
        function(itemService){
            return {
                restrict: 'E',
                scope: {
                    item: '='
                  },
                replace: true,
                templateUrl: 'app/collaboration/partials/item-kanban-card.html',
                link: function($scope, element, attrs) {
                    
                    if ($scope.item.status === itemService.ITEM_STATUS.IDEA) {
                        $scope.picture = $scope.item.author.picture || 'img/account.jpg';
                        $scope.ownerAuthorName =  $scope.item.author.firstname + " " + $scope.item.author.lastname;
                    }

                    $scope.subject = $scope.item.subject;
                    
                    
                }
            };
        }
    ]);
}());