(function() {
    "use strict";

    angular.module('app')
        .directive('scrolly', ["$timeout", function ($timeout) {
            var timer;

            function scrolling(element) {
                angular.element(element).addClass('scrolling');
                if (timer) {
                    $timeout.cancel(timer);
                }

                timer = $timeout(function() {
                    angular.element(element).removeClass('scrolling');
                }, 250);
            }

            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    scope.lastScrollTop = 0;

                    angular.element(element).bind("scroll", function(e) {
                        // console.log(e.target.scrollTop);

                        scrolling(e.target, scope.lastScrollTop);

                        scope.lastScrollTop = e.target.scrollTop;
                    });
                }
            };
        }] );
}());