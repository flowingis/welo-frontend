(function() {
    "use strict";

    angular.module('app')
        .directive('splitArray', [function() {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, element, attr, ngModel) {

                    function fromUser(text) {
                        var s = text.split("\n");
                        return s;
                    }

                    function toUser(array) {
                        return array ? array.join("\r\n") : "";
                    }

                    ngModel.$parsers.push(fromUser);
                    ngModel.$formatters.push(toUser);
                }
            };
        }]);
}());