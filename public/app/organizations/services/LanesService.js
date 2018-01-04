var service = function($http,identity) {

    var create = function(orgId,laneName){
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
    };

    var get = function (orgId) {
        return $http({
            method: 'GET',
            url: 'api/' + orgId + '/settings/lanes',
            headers: { 'GOOGLE-JWT': identity.getToken() },
        }).then(function (response) {
            var lanes = Object.keys(response.data).map(function (key) {
                var result = {};
                result.lcid = key;
                result.lcname = response.data[key];
                return result;
            });

            return lanes || [];
        });
    };


    return {
        create: create,
        get: get
    };
};

angular.module('app').service('lanesService', ['$http','identity', service]);
