angular.module('app.collaboration').service('sortedItemsService', [function(){
    var sortedItems;

    var set = function(id, newSortedItems){
        sortedItems = sortedItems || {};
        sortedItems[id] = newSortedItems;
    };

    var get = function(){
        return sortedItems;
    };

    return {
        set: set,
        get: get
    };
}]);
