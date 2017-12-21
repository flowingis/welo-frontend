(function() {
    "use strict";

    angular.module('app').directive('itemKanbanEditPriorityColumn',[
        'itemService',
        'getSortedItemsAfterMove',
        '$state',
        function(itemService, getSortedItemsAfterMove, $state){
            return {
                restrict: 'E',
                scope: {
                    columnTitle: '@',
                    columnItems: '=',
                    myId: '=',
                    active: '=',
                    onFinishOrder: '&',
                    onSelectItem: '&',
                    onUnselectItem: '&'
                  },
                replace: true,
                templateUrl: 'app/collaboration/partials/item-kanban-edit-priority-column.html',
                link: function($scope, element, attrs) {

                    $scope.maxItemToShow = 6; //andrà letta dai settings
                    $scope.showMoreIsActive = $scope.active ? true : false;
                    $scope.currentState = 0;
                    $scope.selectedItem = undefined;
                    $scope.sortedItems = [];

                    // TODO: try to find solution without $watch
                    var unWatch = $scope.$watch('columnItems',function(newValue){
                        if(newValue){
                            initSortedItems();
                            unWatch();
                        }
                    });

                    var isItemSelected = function(item){
                        return item.id === $scope.selectedItem.id;
                    };

                    var initSortedItems = function(){
                        if($scope.sortedItems.length === 0){
                            $scope.sortedItems = _.map($scope.columnItems, function(item, i){
                                var itemPosition = (i+1);
                                return {
                                    id: item.id,
                                    oldPosition: item.position,
                                    position: itemPosition
                                }
                            });
                        }
                    };

                    var getItemInSortedItems = function(item){
                        return _.find($scope.sortedItems, function(sortedItem){
                            return sortedItem.id === item.id;
                        });
                    };

                    var getPrevItemInSortedItems = function(item){
                        return _.find($scope.sortedItems, function(sortedItem){
                            return sortedItem.position === (getItemInSortedItems(item).position - 1);
                        });
                    };

                    var isPrevSelected = function(item){
                        var prevItem = getPrevItemInSortedItems(item);
                        return prevItem && prevItem.id === $scope.selectedItem.id;
                    };

                    $scope.isPositionChanged = function(item){
                        var itemSorted = getItemInSortedItems(item);
                        return itemSorted.position !== itemSorted.oldPosition;
                    };

                    $scope.resetState = function(){
                        $scope.currentState = 0;
                        $scope.selectedItem = undefined;
                        $scope.onUnselectItem();
                    };

                    $scope.selectItem = function(item, active){
                        if(active && ($scope.currentState === 0)){
                            $scope.selectedItem = item;
                            $scope.currentState = 1;
                            $scope.onSelectItem();
                        }else if(active && ($scope.currentState === 1) && isItemSelected(item)){
                            $scope.resetState();
                        }
                    };

                    var updateOrder = function(){
                        $scope.columnItems = _.sortBy($scope.columnItems, function(item){
                            return _.find($scope.sortedItems, function(sortedItem){
                                return item.id === sortedItem.id;
                            }).position;
                        });
                    };

                    var moveItem = function(item, newPosition){
                        var oldPosition = item.position;
                        var isMovingUp = getSortedItemsAfterMove.isMovingUp(newPosition, oldPosition);
                        if(isMovingUp){
                            $scope.sortedItems = getSortedItemsAfterMove.get($scope.sortedItems, item, newPosition);
                        }else{
                            $scope.sortedItems = getSortedItemsAfterMove.get($scope.sortedItems, item, newPosition - 1);
                        }
                        $scope.resetState();
                        $scope.onFinishOrder({sortedItems: $scope.sortedItems});
                        updateOrder();
                    };

                    $scope.moveHere = function(itemCurrentlyInNewPosition, isLast){
                        if(!isLast){
                            moveItem(getItemInSortedItems($scope.selectedItem), getItemInSortedItems(itemCurrentlyInNewPosition).position);
                        }else{
                            var lastPosition = _.maxBy($scope.sortedItems, function(item){
                                return item.position;
                            }).position;
                            moveItem(getItemInSortedItems($scope.selectedItem), lastPosition+1);
                        }
                    };

                    $scope.showPlaceDestination = function(itemRelated, isLast){
                        return $scope.currentState === 1 && !isItemSelected(itemRelated) && (!isPrevSelected(itemRelated) || isLast);
                    };

                    $scope.hideElements = function() {
                        if ($scope.columnItems) {
                            return $scope.columnItems.length - $scope.maxItemToShow;
                        } else {
                            return 0;
                        }
                    };

                    $scope.toggleShowMore = function($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                        $scope.showMoreIsActive = !$scope.showMoreIsActive;
                    };

                    $scope.isVisible = function($index) {
                        if ($scope.showMoreIsActive) {
                            return true;
                        } else if ($index<$scope.maxItemToShow) {
                            return true;
                        } else {
                            return false;
                        }    
                    };
                }
            };
        }
    ]);
}());