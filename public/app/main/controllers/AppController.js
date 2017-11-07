angular.module('app')
    .controller('AppController', [
        '$scope',
        '$timeout',
        '$mdSidenav',
        '$mdUtil',
        '$log',
        '$stateParams',
        'SelectedOrganizationId',
        '$state',
        function(
            $scope,
            $timeout,
            $mdSidenav,
            $mdUtil,
            $log,
            $stateParams,
            SelectedOrganizationId,
            $state) {

            $scope.$on('$stateChangeSuccess', function() {
                if ($stateParams.orgId) {
                    SelectedOrganizationId.set($stateParams.orgId);
                    $scope.organizationId = $stateParams.orgId;
                }
                
            });

            $scope.toggleLeft = buildToggler('left');
            $scope.toggleRight = buildToggler('right');
            $scope.closeLeft = buildClose('left');

            $scope.menulocked = function() {
                if ($state.current.name === "org.kanban") {
                    return false;
                } else {
                    return true;
                }    
            };

            $scope.clsWithoutSideMenu = function() {
                console.log("fff");
                if ($state.current.name === "org.kanban") {
                    return "withoutSideMenu";
                } else {
                    return "";
                }   
            }


            /**
             * Build handler to open/close a SideNav; when animation finishes
             * report completion in console
             */
            function buildToggler(navID) {
                var debounceFn = $mdUtil.debounce(function() {
                    $mdSidenav(navID)
                        .toggle()
                        .then(function() {
                            $log.debug("toggle " + navID + " is done");
                        });
                }, 200);
                return debounceFn;
            }

            function buildClose(navID) {
                var debounceFn = $mdUtil.debounce(function() {
                    $mdSidenav(navID)
                        .close()
                        .then(function() {
                            $log.debug("toggle " + navID + " is closed");
                        });
                }, 200);
                return debounceFn;
            }


        }
    ]);
