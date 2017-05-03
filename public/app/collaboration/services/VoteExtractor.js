angular.module('app.collaboration').factory('voteExtractor', [function(){
    return function(userId,elm){
        if (elm.status === 0) {
            if (elm.approvals && elm.approvals.hasOwnProperty(userId)) {
                switch (elm.approvals[userId].approval) {
                    case 0:
                        return "You rejected this idea";
                    case 1:
                        return "You have already accepted this idea";
                    case 2:
                        return "You have absteined from voting this idea";
                }
            }
        }

        if (elm.status === 40) {
            if (elm.acceptances && elm.acceptances.hasOwnProperty(userId)) {
                switch (elm.acceptances[userId].acceptance) {
                    case 0:
                        return "You haven't accepted";
                    case 1:
                        return "You have accepted";
                    case 2:
                        return "You have absteined from accepting this work item";
                }
            }
        }
    };
}]);
