angular.module('app')
	.controller('BaseOrganizationController', [
		'$scope',
		'$log',
		'$stateParams',
		'members',
        'streams',
		'SelectedOrganizationId',
        'SetPriorityService',
        'sortedItemsService',
		'$state',
        function(
            $scope,
            $log,
            $stateParams,
            members,
            streams,
			SelectedOrganizationId,
            SetPriorityService,
            sortedItemsService,
			$state) {

                var STATES = ['org.collaboration','org.organizationStatement','org.flow','org.decisions','org.people', 'org.kanban', 'org.kanbanEditPriority'];
                var MINORSTATES = {
                    "org.item":"org.collaboration"
                };

                var checkSelectedStateIndex = function(currentState) {
                    //currentState = MINORSTATES[currentState] || currentState;
                    currentState = _.indexOf(STATES,currentState);
                    currentState = (currentState==5 || currentState==6)?0:currentState;
                    return currentState;
                };
    			if(!SelectedOrganizationId.get()){
    				$state.go("organizations");
    				return;
    			}

				$scope.organization = $scope.identity.getMembership($stateParams.orgId);
                $scope.members = members;
                $scope.stream = streams[0];
                $scope.user = function(member) {
                    if($scope.members && member) {
                        return $scope.members._embedded['ora:member'][member.id];
                    }
                    return null;
                };
				$scope.goBack = function() {
					window.history.back();
				};
                $scope.pillar = {};
                
                $scope.$on('$stateChangeSuccess',
                    function(event, toState) {
                        if(toState.data && toState.data.pillarName){
                            $scope.pillar.name = toState.data.pillarName;
                        }
                        if(toState.data && toState.data.pillarId){
                            $scope.pillar.id = toState.data.pillarId;
                        }else{
                            //TODO: understand if it's possible reset $scope.pillar on every $stateChangeSuccess
                            $scope.pillar.id = undefined
                        }
                        if(toState.data && toState.data.selectedTab){
                            $scope.currentTab = toState.data.selectedTab;
                        }
                        if(toState.data && toState.data.showBack) {
                            $scope.showBack = true;
                        } else {
                            $scope.showBack = false;
                        }
						if(toState.data){
                            $scope.fullHeight = toState.data.fullHeight;
                        }

                    }
                );

                var selectedOrganizationId = SelectedOrganizationId.get();
                    if(selectedOrganizationId){
                        $scope.organizationId = selectedOrganizationId;
                    }else{
                        $scope.organizationId = null;
                        identity.loadMemberships().then(function(memberships){
                            if(memberships && memberships.length){
                                $scope.organizationId = memberships[0].organization.id;
                            }
                    });
                }

                $scope.navigationBarTabs = {
                    selectedIndex: checkSelectedStateIndex($state.current.name)
                };
                $scope.$on('$stateChangeSuccess',
                    function(event, toState) {
                        $scope.navigationBarTabs.selectedIndex = checkSelectedStateIndex(toState.name);
                    }
                );

                $scope.backFromKanbanEditPriority = function(isCanceling){
                    if(isCanceling){
                        $state.go("org.kanban", { orgId: $scope.organizationId });
                    }else{
                        var sortedItems = sortedItemsService.get();
                        if(sortedItems){
                            SetPriorityService.set(sortedItems).then(function(data){
                                console.log("success: ", data);
                                $state.go("org.kanban", { orgId: $scope.organizationId });
                            }).catch(function(err){
                                console.log("err: ", err)
                            })["finally"](function(){
                                console.log('finally');
                            });
                        }
                    }
                };
            }
		]);
