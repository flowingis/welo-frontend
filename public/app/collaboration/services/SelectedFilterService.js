angular.module('app.collaboration').service('selectedFilterService', [function(){
    var filters;

    var set = function(newFilters){
        filters = newFilters;
    };

    var get = function(){
        return filters;
    };

    return {
        set: set,
        get: get
    };
}]);
