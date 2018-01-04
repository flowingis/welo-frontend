var service = function($http,identity) {
    return {
        create:function(orgId,laneName){
            return $http({
    			method:'POST',
    			url:'api/' + orgId + '/settings/lanes',
                headers: { 'GOOGLE-JWT': identity.getToken() },
                data: {
                    "name":laneName
                }
    		}).then(function(response){
                return response;
            });
        }
    };
};

angular.module('app').service('lanesService', ['$http','identity', service]);
