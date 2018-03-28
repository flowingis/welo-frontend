angular.module('app.collaboration')
    .constant('USER_PHRASE', {
        'TaskCreated':  ' by ',
        'TaskOngoing': ' owned by '
    })
    .filter('logActivityFilter', ['USER_PHRASE', function(USER_PHRASE) {
        var getFormatedName = function(historyElement){
            return (historyElement.name) ? historyElement.name.replace(/([A-Z])/g, ' $1').replace(/Task/g, 'Item') : '';
        };
        var getUserName = function(h){
            return h.user && h.user.name;
        };
        var getVote = function(h){
            return h && h.payload && h.payload.vote;
        };
        var getAssignedShares = function(h){
            var userId = h.user.id;
            return h.payload.shares[userId] * 100;
        };
        var getLogDescription = {
            OwnerRemoved: function(h){ return getFormatedName(h)+" by "+getUserName(h); },
            OwnerAdded: function(h){ return getFormatedName(h)+" by "+getUserName(h); },
            OwnerChanged: function(h){ return getFormatedName(h)+" from "+h.payload.ex_owner_name+" to "+h.payload.new_owner_name; },
            TaskMemberAdded: function(h){
                if(h.user.id === h.payload.userId){
                    return getUserName(h)+" is taking part in this Item";
                }else{
                    return h.payload.userName+" added to item by "+getUserName(h);
                }
            },
            TaskMemberRemoved: function(h){
                if(h.user.id === h.payload.userId){
                    return getUserName(h)+" is no longer taking part in this Item";
                }else{
                    return h.payload.userName+" removed from item by "+getUserName(h);
                }
            },
            TaskCreated: function(h){ return getFormatedName(h)+" by "+getUserName(h); },
            TaskUpdated: function(h){
                var changes = [];
                if(h.payload.subject !== h.payload.previousSubject){
                    changes.push("subject changed from \""+(h.payload.previousSubject || "")+"\" to \""+(h.payload.subject || "")+"\"");
                }
                if(h.payload.description !== h.payload.previousDescription){
                    changes.push("description changed");
                }
                if(h.payload.laneName !== h.payload.previousLaneName){
                    changes.push("lane changed from \""+(h.payload.previousLane || "")+"\" to \""+(h.payload.lane || "")+"\"");
                }
                if(changes.length > 0){
                    return getFormatedName(h)+": "+changes.join(' and ');
                }else{
                    return getFormatedName(h);
                }
            },
            TaskCompleted: function(h){ return "Item marked as Completed by "+getUserName(h); },
            TaskAccepted: function(h){ return getFormatedName(h); },
            TaskArchived: function(h){ return getFormatedName(h); },
            TaskOpened: function(h){ return getFormatedName(h); },
            TaskClosed: function(h){ return getFormatedName(h)+" by "+getUserName(h); }, //TO CHECK
            TaskOngoing: function(h){ return getFormatedName(h)+" owned by "+getUserName(h); },
            TaskReopened: function(h){ return getFormatedName(h); },
            TaskRevertedToOpen: function(h){ return getFormatedName(h)+" by "+getUserName(h); },
            TaskRevertedToOngoing: function(h){ return getFormatedName(h)+" by "+getUserName(h); },
            TaskRevertedToIdea: function(h){ return getFormatedName(h)+" by "+getUserName(h); },
            TaskClosedByTimebox: function(h){ return getFormatedName(h); },
            TaskNotClosedByTimebox: function(h){ return getFormatedName(h); },
            ApprovalCreated: function(h){
                var vote = getVote(h);
                if(vote === 0){
                    return getUserName(h)+" voted to Reject the Idea";
                }else if(vote === 1){
                    return getUserName(h)+" voted to Accept the Idea";
                }else if(vote === 2){
                    return getUserName(h)+" Abstained from voting on Approval";
                }
            },
            AcceptanceCreated: function(h){
                var vote = getVote(h);
                if(vote === 0){
                    return getUserName(h)+" voted to Reject the Item";
                }else if(vote === 1){
                    return getUserName(h)+" voted to Accept the Item";
                }else if(vote === 2){
                    return getUserName(h)+" Abstained from voting on Acceptance";
                }
            },
            CreditsAssigned: function(h){ return getFormatedName(h); },
            SharesAssigned: function(h){ return getUserName(h)+" assigned shares"; },
            SharesSkipped: function(h){ return getUserName(h)+" skipped shares"; },
            EstimationAdded: function(h){ //Aggiunto
                var estimate = h.payload && h.payload.value;
                if(estimate >= 0){
                    return getUserName(h)+" made an estimate of this Item"
                }else{
                    return getUserName(h)+" skipped estimate of this Item"
                }
            }
        };
        var getLogFromHistoryElement = function(date, historyElement){
            var description = getLogDescription[historyElement.name] ? getLogDescription[historyElement.name](historyElement) : getFormatedName(historyElement);
            return date+" "+description;
        };

        return function(historyElement) {
            var date = moment(historyElement.on,"DD/MM/YYYY HH:mm:SS").format('DD/MM/YYYY');
            // var name = getFormatedName(historyElement);
            // var historyEvent = date + " - " + name;

            // if (USER_PHRASE.hasOwnProperty(historyElement.name) && historyElement.user.name) {
            //     historyEvent += USER_PHRASE[historyElement.name] + historyElement.user.name;
            // }

            // return historyEvent;
            return getLogFromHistoryElement(date, historyElement);
        };
    }]);
