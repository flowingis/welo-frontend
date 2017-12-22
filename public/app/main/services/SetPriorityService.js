var SetPriorityService = function($http, identity) {
    var mapNewPriority = function(newPriority){
        var toReturn = {};
        _.each(newPriority, function(lanePriority){
            _.each(lanePriority, function(item){
                if(item.oldPosition !== item.position){
                    toReturn[item.id] = item.position;
                }
            });
        });
        return toReturn;
    };
    var set = function(orgId, newPriority){
        return $http({
            method: 'POST',
            url: '/'+orgId+'/task-management/tasks/positions',
            headers: { 'GOOGLE-JWT': identity.getToken() },
            data: mapNewPriority(newPriority)
        });
    };
    return {
        set:set
    };
};

angular.module('app').service('SetPriorityService', ['$http', 'identity', SetPriorityService]);
