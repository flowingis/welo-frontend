var SetPriorityService = function($q) {
    var set = function(newPriority){
        var deferred = $q.defer();
        console.log("newPriority: ", newPriority);
        setTimeout(function() {
            // deferred.notify('');
            if(true){
                deferred.resolve("ok");
            }else{
                deferred.reject("ko");
            }
        }, 1000);
        return deferred.promise;
    };
    return {
        set:set
    };
};

angular.module('app').service('SetPriorityService', ['$q', SetPriorityService]);
