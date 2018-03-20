var labelTranslation = {
    "People\\OrganizationMemberAdded": "joined on",
    "People\\OrganizationMemberRoleChanged": "changed role to",
    "People\\OrganizationMemberRemoved": "left on",
    "People\\Event\\OrganizationMemberActivationChanged": "activation changed"
};

angular.module('app.collaboration').filter('historyNameToLabel', function() {
        return function(name, role, active) {
            var toReturn = labelTranslation[name];
            if(name === "People\\OrganizationMemberRoleChanged"){
                toReturn = toReturn+" "+role+" on";
            }
            if(name === "People\\Event\\OrganizationMemberActivationChanged"){
                if (active) {
                    toReturn = "activated on";
                } else {
                    toReturn = "deactivated on";
                }
            }    
            return toReturn;
        };
    });
