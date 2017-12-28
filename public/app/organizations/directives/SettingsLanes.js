(function() {
    "use strict";
    angular.module('app').directive('settingsLanes',[
        'itemService',
        '$state',
        function(itemService, $state){
            return {
                restrict: 'E',
                scope: {
                    lanes: '='
                },
                replace: true,
                templateUrl: 'app/organizations/partials/settings-lanes.html',
                link: function($scope, element, attrs) {
                    
                }
            };
        }
    ]);
}());