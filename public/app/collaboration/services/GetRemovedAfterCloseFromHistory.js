angular.module('app.collaboration').factory('getRemovedAfterCloseFromHistory', [function(){
    var getEventsAfterClosed = function(history){
        var closedIndex = _.findIndex(history, function(event){
            return event.name === "TaskCompleted";
        });
        return history.slice(closedIndex);
    };

    var getRemoveEvents = function(historyAfterClose){
        return _.filter(historyAfterClose, function(event){
            return event.name === "TaskMemberRemoved";
        });
    };

    var getRemovedMembersName = function(historyAfterClose){
        var removeEvents = getRemoveEvents(historyAfterClose);
        var memberRemoveEvents = _.filter(removeEvents, function(event){
            return event.payload.role === "member";
        });
        return _.reduce(memberRemoveEvents, function(acc, event){
            return acc.concat(event.payload.userName);
        }, []);
    };

    var getRemovedOwnerName = function(historyAfterClose){
        var removeEvents = getRemoveEvents(historyAfterClose);
        var ownerRemoveEvent = _.find(removeEvents, function(event){
            return event.payload.role === "owner";
        }) || {payload: {}};
        return ownerRemoveEvent.payload.userName;
    };

    var get = function(history){
        var eventsAfterClosed = getEventsAfterClosed(history);
        var owner = getRemovedOwnerName(eventsAfterClosed);
        var members = getRemovedMembersName(eventsAfterClosed);
        var all = [];
        if(owner){
            all = all.concat(owner).concat(members);
        }else{
            all = all.concat(members);
        }
        return {
            owner: owner,
            members: members,
            all: all
        }
    };

    return {
        get: get
    };
}]);
