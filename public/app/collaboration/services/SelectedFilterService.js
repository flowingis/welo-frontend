angular.module('app.collaboration').service('selectedFilterService', [function(){
    var filters;

    var set = function(newFilters){
        console.log('set: ', newFilters);
        filters = newFilters;
    };

    var get = function(){
        console.log('get: ', filters);
        return filters;
    };

    return {
        set: set,
        get: get
    };
}]);
