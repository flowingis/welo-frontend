var MembersDataService = function() {
    var membersData = {};

    var set = function(data){
        membersData = data;
    };

    var get = function(){
        return membersData;
    };

    var isActive = function(memberId){
        return membersData[memberId] && membersData[memberId].active;
    };

    return {
        set: set,
        get: get,
        isActive: isActive
    };
};

angular.module('app').service('membersDataService', [MembersDataService]);
