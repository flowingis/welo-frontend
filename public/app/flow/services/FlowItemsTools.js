angular.module('app.flow').factory('FlowItemsTools', [function(){
    var orderItemsByData = function(items){
        return _.reverse(_.orderBy(items, function(item){
            return (new Date(item.createdAt)).getTime();
        }));
    };

    var objToArray = function(obj){
        return orderItemsByData(_.values(obj));
    };
    
    var merge = function(oldItems, newItems) {
        if(oldItems){
            oldItems = JSON.parse(JSON.stringify(oldItems));
        }else{
            oldItems = [];
        }
        newItems = JSON.parse(JSON.stringify(newItems));

        var itemAlreadyInList = function(itemsList, itemToCheck) {
            return !!_.find(itemsList, function(item){
                return item.id === itemToCheck.id;
            });
        };

        var mergedItems = [];

        _.each(newItems, function(item){
            if(!itemAlreadyInList(oldItems, item)){
                mergedItems.push(item);
            }
        });

        var items = orderItemsByData(mergedItems.concat(oldItems));
        
        return {
            items: items,
            hadNewItems: (items.length > oldItems.length) 
        };
    };


    return {
        merge: merge,
        objToArray: objToArray
    };
}]);