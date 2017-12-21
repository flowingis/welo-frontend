angular.module('app.collaboration').service('sortedItemsService', [function(){
    var sortedItems;

    var set = function(newSortedItems){
        sortedItems = newSortedItems;
    };

    var get = function(){
        return sortedItems;
    };

    return {
        set: set,
        get: get
    };
}]);
