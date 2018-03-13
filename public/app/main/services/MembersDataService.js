var MembersDataService = function() {
    var membersData = {};

    var set = function(data){
        membersData = data;
    };

    var get = function(){
        return membersData;
    };

    return {
        set: set,
        get: get
    };
};

angular.module('app').service('membersDataService', [MembersDataService]);
