angular.module('app.collaboration').factory('getSortedItemsAfterMove', [function(){
    var isMovingUp = function(newPosition, oldPosition){
        return newPosition < oldPosition;
    };

    var get = function(sortedItems, item, newPosition){
        var newSortedItems = JSON.parse(JSON.stringify(sortedItems));
        var oldPosition = item.position;
        _.each(newSortedItems, function(sortedItem){
            if(isMovingUp(newPosition, oldPosition)){
                if(sortedItem.position >= newPosition && sortedItem.position < oldPosition){
                    sortedItem.position = sortedItem.position + 1;
                }
                if(item.id === sortedItem.id){
                    sortedItem.position = newPosition;
                }
            }else{
                if(sortedItem.position <= newPosition && sortedItem.position > oldPosition){
                    sortedItem.position = sortedItem.position - 1;
                }
                if(item.id === sortedItem.id){
                    sortedItem.position = newPosition;
                }
            }
        });
        return newSortedItems;
    };

    return {
        isMovingUp: isMovingUp,
        get: get
    };
}]);
