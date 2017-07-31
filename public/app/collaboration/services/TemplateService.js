angular.module('app.collaboration').service('templateService', ['$q',function($q){

    var TEMPLATES = [{
        name: "Ordinary Activity",
        value: "This activity should be done because:\n[insert reasons of this work item]\n\nThe expected outcome / deliverables will be:\n[insert list and descriptions of the results that are expected and that will be examined for acceptance]"
    },{
        name: "Improvement",
        value: "This work item will improve:\n[add description of what should be improved by this activity]\n\nIt is needed because:[add reasons why this will be a good improvement, and we need it]\n\nThe expected outcome / deliverables will be:\n[insert list and descriptions of the results that are expected and that will be examined for acceptance]"
    },{
        name: "Very Important",
        value: "This work item is very important because:\n[add reasons for its high importance]\n\nThe expected outcome / deliverables will be:\n[insert list and descriptions of the results that are expected and that will be examined for acceptance]"
    },{
        name: "Problem Solver",
        value: "This item will solve the following problem:\n[add the description of the problem to be solved by this item]\n\nThis problem has been detected by / on:\n[add the name(s) of who detected the problem and when]\n\nThe expected outcome / deliverables will be:\n[insert list and descriptions of the results that are expected and that will be examined for acceptance]"
    }];

    var DECISION_TEMPLATES = [{
        name: "Decision",
        value: "This decision should be taken because:\n[insert reasons for this decision]\n\nThe foreseen implications / constraints seem to be:\n[insert list and descriptions of the elements to take in account and that will be examined for acceptance]"
    },{
        name: "Urgent Decision",
        value: "This decision should be taken because:\n[insert reasons for this decision]\n\nThis decision is particularly urgent because:\n[add reasons for its high urgency]\n\nThe foreseen implications / constraints seem to be:\n[insert list and descriptions of the elements to take in account and that will be examined for acceptance]"
    }];

    var templateOfItemType = {
        'workItem': TEMPLATES,
        'decisionItem': DECISION_TEMPLATES
    };

    return {
        list:function(itemType){
            var deferred = $q.defer();
            deferred.resolve(templateOfItemType[itemType]);
            return deferred.promise;
        }
    };
}]);
