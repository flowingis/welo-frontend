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
			$scope.lanesLoading = false;
			$scope.loadingSettings = true;
			$scope.managePriorityWelo = false;
			$scope.manageLanesWelo = false;
			$scope.thereAreSomeLanes = false;
			$scope.kanbanizeCommunicationError = false;
			
			
			var getCheckboxFromSettingValue = function(setting_value) {
				return setting_value === "1";
			};

			var getCheckboxForSettingValue = function(checkbox_value) {
				return checkbox_value ? "1" : "0";
			};

			$scope.onLanesLoaded = function(lanes) {
				$scope.thereAreSomeLanes = (lanes.length!==0);
			};
			$scope.toggleLanesLoading = function() {
				$scope.lanesLoading = !$scope.lanesLoading;
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
			

			$scope.kanbanizeSectionAllowed = function() {
				return kanbanizeService.isAllowed('editKanbanizeSettings', $scope.organization);
			};

			$scope.canShowKanbanizeBlock = function() {
				return (!$scope.managePriorityWelo && !$scope.manageLanesWelo && $scope.kanbanizeSectionAllowed() && !$scope.loadingKanbanize);
			};

			$scope.orgSettings = {};
			
			var loadSetting = function() {
				$scope.loadingSettings = true;
				settingsService.get($stateParams.orgId).then(function(settings){
					$scope.orgSettings = settings;
					$scope.managePriorityWelo = getCheckboxFromSettingValue(settings.manage_priorities);
					$scope.manageLanesWelo = getCheckboxFromSettingValue(settings.manage_lanes);
					$scope.loadingSettings = false;
				});
			};

			loadSetting();
            

            this.updateSettings = function(){
				$scope.loadingSettings = true;
                settingsService.set($stateParams.orgId,$scope.orgSettings).then(function() {
					$mdToast.show(
						$mdToast.simple()
							.textContent('Settings updated')
							.position('bottom right')
							.hideDelay(3000)
					);
					loadSetting();
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

			$scope.reloadPage = function() {
				window.location.reload();
			};
			
			var loadKanbanizeData = function() {
				kanbanizeService.query($stateParams.orgId,
					function(data) {
						$scope.settings.subdomain = data.subdomain;
						$scope.settings.apiKey = data.apikey;
						$scope.projects = data.projects;
						$scope.boards = readBoards(data.projects);
						$scope.loadingKanbanize = false;
						$scope.kanbanizeCommunicationError = false;
					},
					function(httpResponse) {
						console.log(httpResponse);
						switch(httpResponse.status) {
							case 400:
								if (httpResponse.data && httpResponse.data.description &&   httpResponse.data.description==="error_on_kanbanize_get_board") {
									$scope.kanbanizeCommunicationError = true;
									$scope.loadingKanbanize = false;
								} else {
									try{
										httpResponse.data.errors.forEach(function(error) {
											$scope.form[error.field].$error.remote = error.message;
										});
									}catch(err){
										alert('Generic Error during server communication (error: ' + httpResponse.status + ' ' + httpResponse.statusText + ') ');
									}
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
