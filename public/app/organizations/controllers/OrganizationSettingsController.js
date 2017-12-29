angular.module('app')
	.controller('OrganizationSettingsController', [
		'$scope',
		'$log',
		'$stateParams',
		'organizationService',
		'kanbanizeService',
		'$state',
		'streamService',
		'$mdDialog',
        'settingsService',
        'itemService',
		'$mdToast',
		function (
			$scope,
			$log,
			$stateParams,
			organizationService,
			kanbanizeService,
			$state,
            streamService,
			$mdDialog,
            settingsService,
            itemService,
			$mdToast) {

			$scope.settings = {};
			$scope.boards = [];
            $scope.board = null;
            $scope.columns = [];
            $scope.projects = [];
            $scope.ITEM_STATUS = itemService.ITEM_STATUS;
			$scope.loadingKanbanize = true;
			$scope.managePriorityWelo = false;
			$scope.manageLanesWelo = false;
			
			var getCheckboxFromSettingValue = function(setting_value) {
				return setting_value === "1";
			};

			var getCheckboxForSettingValue = function(checkbox_value) {
				return checkbox_value ? "1" : "0";
			};
			
            // $scope.lanes = [ { label: 'test 0', id: 'test0'}, { label: 'test 1', id: 'test1'}, { label: 'test 2', id: 'test2'}, { label: 'test 3', id: 'test3'} ];
            $scope.updateLanes = function(newLanes){
                $scope.lanes = newLanes;
            };

            $scope.saveLanes = function(newLanes){
                $scope.orgSettings.lanes = newLanes;
                // console.log("saveLanes: ", newLanes);
            };

			var readBoards = function(projects){

				var boards = _.map(projects,function (p) {
					return p.boards;
				});

				boards = _.flatten(boards,true);

                $scope.board = findSelectedBoard(boards);

                return boards;
			};

            var findSelectedBoard = function(boards){
                var board = _.find(boards,function(b){
                   return !!b.streamId;
                });

                return board && board.id;
            };

            $scope.changeManagePriorities = function(managePriorityWelo){
                $scope.managePriorityWelo = managePriorityWelo;
                $scope.orgSettings.manage_priorities = getCheckboxForSettingValue($scope.managePriorityWelo);
			};
			
			$scope.changeManageLanes = function(manageLanesWelo){
                $scope.manageLanesWelo = manageLanesWelo;
                $scope.orgSettings.manage_lanes = getCheckboxForSettingValue($scope.manageLanesWelo);
            };

			$scope.kanbanizeSectionAllowed = kanbanizeService.isAllowed.bind(kanbanizeService);

            $scope.orgSettings = {};
            settingsService.get($stateParams.orgId).then(function(settings){
                $scope.orgSettings = settings;
<<<<<<< HEAD
				$scope.managePriorityWelo = getCheckboxFromSettingValue(settings.manage_priorities);
				$scope.manageLanesWelo = getCheckboxFromSettingValue(settings.manage_lanes);
=======
                if($scope.orgSettings.lanes){
                    $scope.lanes = JSON.parse(JSON.stringify($scope.orgSettings.lanes));
                }else{
                    $scope.lanes = [];
                }
>>>>>>> 0ee62bc... added meachnism for add lane
            });

            this.updateSettings = function(){
                settingsService.set($stateParams.orgId,$scope.orgSettings).then(function() {
					$mdToast.show(
						$mdToast.simple()
							.textContent('Settings updated')
							.position('bottom left')
							.hideDelay(3000)
					);
				});
            };

			this.updateKanbanizeSettings = function(){
				$scope.projects = [];
				$scope.boards = [];
				$scope.updatingKanbanize = true;
				kanbanizeService.updateSettings($stateParams.orgId, $scope.settings,
					function(data) {
                        $scope.projects = data.projects;
                        $scope.boards = readBoards(data.projects);
						$scope.updatingKanbanize = false;
						$mdToast.show(
							$mdToast.simple()
								.textContent('Kanbanize account updated')
								.position('bottom left')
								.hideDelay(3000)
						);
					},
					function(httpResponse) {
						$scope.updatingKanbanize = false;
						switch(httpResponse.status) {
							case 400:
								httpResponse.data.errors.forEach(function(error) {
									$scope.form[error.field].$error.remote = error.message;
								});
								break;
							default:
								alert('Generic Error during server communication (error: ' + httpResponse.status + ' ' + httpResponse.statusText + ') ');
								$log.warn(httpResponse);
						}
					}
				);
			};

			var printMappingError = function(data) {

				var mappingError = _.find(data.errors,function(error){
					return error.field === 'mapping';
				});

				if(mappingError){
					$mdToast.show(
						$mdToast.simple()
							.textContent(mappingError.message)
							.position('bottom left')
							.hideDelay(3000)
					);
				}
			};

			var executeSaveKanbanizeBoard = function(){
				$scope.updatingKanbanize = true;
				kanbanizeService.saveBoardSettings($stateParams.orgId, $scope.board, $scope.boardSetting,
					function(data) {
						$scope.updatingKanbanize = false;
						$mdToast.show(
							$mdToast.simple()
								.textContent('Board configuration saved')
								.position('bottom left')
								.hideDelay(3000)
						);
					},
					function(httpResponse) {
						$scope.updatingKanbanize = false;
						switch(httpResponse.status) {
							case 400:
								printMappingError(httpResponse.data);
								httpResponse.data.errors.forEach(function(error) {
									if($scope.boardList[error.field]){
										$scope.boardList[error.field].$error.remote = error.message;
									}
								});
								break;
							default:
								alert('Generic Error during server communication (error: ' + httpResponse.status + ' ' + httpResponse.statusText + ') ');
								$log.warn(httpResponse);
						}
					}
				);
			};

			this.saveKanbanizeBoards = function($event){
				$mdDialog.show({
					controller: "ConfirmSavaKanbanizeSettingsController",
					templateUrl: "app/organizations/partials/confirm-kanbanize.html",
					targetEvent: $event,
					clickOutsideToClose: true
				}).then(function(){
					executeSaveKanbanizeBoard();
				});
			};

            $scope.detachFromKanbanize = function(){
                var confirm = $mdDialog.confirm()
                    .title("Would you detach from Kanbanize?")
                    .textContent("The information between this board and kanbanize will no longer be synchronized.")
                    .ok("Yes")
                    .cancel("No");

                $mdDialog.show(confirm).then(function () {
                    kanbanizeService.detach($stateParams.orgId).then(function(result){
						console.log("detachFromKanbanize: ", result);
						$mdToast.show(
							$mdToast.simple()
								.textContent('Kanbanize account updated')
								.position('bottom left')
								.hideDelay(3000)
						);
						loadKanbanizeData();
                    });
                });

			};
			
			var loadKanbanizeData = function() {
				kanbanizeService.query($stateParams.orgId,
					function(data) {
						$scope.settings.subdomain = data.subdomain;
						$scope.settings.apiKey = data.apikey;
						$scope.projects = data.projects;
						$scope.boards = readBoards(data.projects);
						$scope.loadingKanbanize = false;
					},
					function(httpResponse) {
						switch(httpResponse.status) {
							case 400:
								try{
									httpResponse.data.errors.forEach(function(error) {
										$scope.form[error.field].$error.remote = error.message;
									});
								}catch(err){
									alert('Generic Error during server communication (error: ' + httpResponse.status + ' ' + httpResponse.statusText + ') ');
								}
								break;
							default:
								alert('Generic Error during server communication (error: ' + httpResponse.status + ' ' + httpResponse.statusText + ') ');
								$log.warn(httpResponse);
						}
					}
				);
			};

			loadKanbanizeData();

			var loadStreams = function(){
				$scope.streams = [];
				streamService.query($stateParams.orgId, function(data) {
					$scope.streams = _.values(data._embedded['ora:stream']);
				});
			};

            var findProjectId = function(projects,boardId){
                var project = _.find(projects,function(project){
                    return _.find(project.boards,function(board){
                       return board.id === boardId;
                    });
                });

                return project && project.id;
            };

            var unwatchBoard = $scope.$watch('board',function(){
               if($scope.board){
                   kanbanizeService.getBoardDetails($stateParams.orgId, $scope.board,function(data){
					   var stream = $scope.streams[0];

					   $scope.boardSetting = _.extend(data,{
                           projectId : findProjectId($scope.projects,$scope.board),
						   streamId: stream.id,
						   streamName: stream.subject
                       });

                       console.log($scope.boardSetting);
                   });
               }
            });

            $scope.$on('$destroy',function(){
               unwatchBoard();
            });

			loadStreams();

		}]);
