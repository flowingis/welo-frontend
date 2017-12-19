(function() {
    "use strict";

    angular.module('app').directive('itemKanbanEditPriorityColumn',[
        'itemService',
        '$state',
        function(itemService, $state){
            return {
                restrict: 'E',
                scope: {
                    columnTitle: '@',
                    columnItems: '=',
                    myId: '=',
                    active: '='
                  },
                replace: true,
                templateUrl: 'app/collaboration/partials/item-kanban-edit-priority-column.html',
                link: function($scope, element, attrs) {

                    $scope.maxItemToShow = 6; //andrà letta dai settings
                    $scope.showMoreIsActive = false;
                    $scope.currentState = 0;
                    $scope.selectedItem = undefined;
                    $scope.sortedItems = [];

                    // usefull for init $scope.sortedItems
                    // TODO: try to find solution without $watch
                    $scope.$watch('columnItems',function(newValue){
                        if(newValue){
                            _.each(newValue, function(item, i){
                                item.position = i+1;
                            });
                            initSortedItems();
                        }
                    });

                    var isItemSelected = function(item){
                        return item.id === $scope.selectedItem.id;
                    };

                    var initSortedItems = function(){
                        if($scope.sortedItems.length === 0){
                            $scope.sortedItems = _.map($scope.columnItems, function(item, i){
                                var itemPosition = item.position !== null ? item.position : (i+1);
                                return {
                                    id: item.id,
                                    oldPosition: itemPosition,
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

                    $scope.resetState = function(){
                        $scope.currentState = 0;
                        $scope.selectedItem = undefined;
                    };

                    $scope.selectItem = function(item, active){
                        // initSortedItems();
                        if(active && ($scope.currentState === 0)){
                            $scope.selectedItem = item;
                            $scope.currentState = 1;
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
                        var isMovingUp = newPosition < oldPosition;
                        _.each($scope.sortedItems, function(sortedItem){
                            if(isMovingUp){
                                if(sortedItem.position >= newPosition && sortedItem.position < oldPosition){
                                    sortedItem.position = sortedItem.position + 1;
                                }
                                if(item.id === sortedItem.id){
                                    sortedItem.position = newPosition;
                                }
                            }else{
                                if(sortedItem.position < newPosition && sortedItem.position >= oldPosition){
                                    sortedItem.position = sortedItem.position - 1;
                                }
                                if(item.id === sortedItem.id){
                                    sortedItem.position = newPosition -1;
                                }
                            }

                        });
                        updateOrder();
                    };

                    $scope.moveHere = function(itemCurrentlyInNewPosition, isLast){
                        if(!isLast){
                            moveItem($scope.selectedItem, itemCurrentlyInNewPosition.position);
                        }else{
                            var lastPosition = _.maxBy($scope.sortedItems, function(item){
                                return item.position;
                            }).position;
                            moveItem($scope.selectedItem, lastPosition+1);
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