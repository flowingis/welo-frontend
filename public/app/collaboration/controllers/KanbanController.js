angular.module('app.collaboration')
	.controller('KanbanController', [
		'$scope',
		'$log',
		'$stateParams',
		'$mdDialog',
		'$mdToast',
		'streamService',
		'itemService',
		'$state',
		'selectedFilterService',
		'$q',
		'lanesService',
		'kanbanizeService',
		'settingsService',
		function (
			$scope,
			$log,
			$stateParams,
			$mdDialog,
			$mdToast,
			streamService,
			itemService,
			$state,
			selectedFilterService,
			$q,
			lanesService,
			kanbanizeService,
			settingsService) {

			$scope.menu = {
				open:false
			};
			$scope.closeLeft();

			$scope.currentUserId = $scope.identity.getId();
			$scope.lanes = null;
			$scope.loadingItems = true;
			$scope.ITEM_STATUS = itemService.ITEM_STATUS;
			$scope.kanbanItems = {};
			$scope.priorityManaged = false;
			$scope.lanesManaged = false;

			$scope.isAllowed = function(command, resource) {
				return itemService.isAllowed(command, resource);
			};

			$scope.openNewItem = function(ev, decision, itemType) {
				$mdDialog.show({
					controller: NewItemController,
					controllerAs: 'dialogCtrl',
					templateUrl: "app/collaboration/partials/new-item.html",
					targetEvent: ev,
					clickOutsideToClose: true,
					locals: {
						lanesManaged: $scope.lanesManaged,
						lanes: $scope.lanes,
						decisionMode: decision,
						streams: [$scope.stream],
						itemType: itemType,
						orgId: $stateParams.orgId
					}
				}).then($scope.onItemAdded);
			};

			$scope.onItemAdded = function(newItem){
				getItemForKanban();
				$mdDialog.show({
					controller: "OnItemAddedDialogController",
					templateUrl: "app/collaboration/partials/on-item-added-dialog.html",
					clickOutsideToClose: true,
					locals: {
						item: newItem
					}
				}).then(function(){
					$state.go('org.item',{
						orgId: newItem.organization.id,
						itemId: newItem.id
					});
				});
			};

			var getItemForStatus = function(stateId, kanbanItems) {
				var deferred = $q.defer();
				var filters = {
					offset: 0,
					limit: 30,
					status: stateId,
					cardType: "All",
					memberId: null,
					orderBy: "position", 
					orderType: "asc"
				};
				itemService.query($stateParams.orgId, filters,
					function(data) {
						_(kanbanItems).each(function(lane, idlane){
							if (idlane==="0") {
								lane.cols[stateId] = data._embedded['ora:task'];
							} else if (idlane==="-1"){
								lane.cols[stateId] = _.filter(data._embedded['ora:task'],function(item) {
									return lanesService.itemLaneMissed(item.lane, $scope.lanes); //Mi dice se il valore dell'atributo lane dell'item non corrisponde a nessuna delle lane attualmente presenti
								});

							} else {		
								lane.cols[stateId] = _.filter(data._embedded['ora:task'],function(item) {
									if (item.lane == idlane) {
										return true;
									} else {
										return false;
									}
								});
							}
							
						});
						deferred.resolve(kanbanItems);
					},
					function(response) {
						deferred.reject(response);
					});
				return deferred.promise;	
			};

			var removeLaneIfIsEmpty = function(kanbanItems, lcid) {
				if (!kanbanItems[lcid]) {
					return kanbanItems;
				}
				if (kanbanItems[lcid].cols[$scope.ITEM_STATUS.IDEA].length===0 &&
					kanbanItems[lcid].cols[$scope.ITEM_STATUS.OPEN].length===0 &&
					kanbanItems[lcid].cols[$scope.ITEM_STATUS.ONGOING].length===0 &&
					kanbanItems[lcid].cols[$scope.ITEM_STATUS.COMPLETED].length===0 &&
					kanbanItems[lcid].cols[$scope.ITEM_STATUS.ACCEPTED].length===0 &&
					kanbanItems[lcid].cols[$scope.ITEM_STATUS.CLOSED].length===0) {
					delete kanbanItems[lcid];
				}
				return kanbanItems;
			};


			var getItemForKanban = function() {
				$scope.loadingItems = true;

				getItemForStatus($scope.ITEM_STATUS.IDEA, $scope.kanbanItems).then(function(kanbanItems){
					$scope.kanbanItems = kanbanItems;
					return getItemForStatus($scope.ITEM_STATUS.OPEN,kanbanItems);
				}).then(function(kanbanItems) {
					$scope.kanbanItems = kanbanItems;
					return getItemForStatus($scope.ITEM_STATUS.ONGOING,kanbanItems);
				}).then(function(kanbanItems) {
					$scope.kanbanItems = kanbanItems;
					return getItemForStatus($scope.ITEM_STATUS.COMPLETED,kanbanItems);
				}).then(function(kanbanItems) {
					$scope.kanbanItems = kanbanItems;
					return getItemForStatus($scope.ITEM_STATUS.ACCEPTED,kanbanItems);
				}).then(function(kanbanItems) {
					$scope.kanbanItems = kanbanItems;
					return getItemForStatus($scope.ITEM_STATUS.CLOSED,kanbanItems);
				}).then(function(kanbanItems) {
					$scope.kanbanItems = kanbanItems;
					$scope.kanbanItems = removeLaneIfIsEmpty($scope.kanbanItems, "-1");
					$scope.loadingItems = false;
				}, function(response){
					onHttpGenericError(response);
				});
			};

			var goToFilterdItems = function(status){
				var filters = {
					"offset":0,
					"limit":20,
					"status":status,
					"cardType":"all",
					"memberId":null,
					"orderBy":"mostRecentEditAt",
					"orderType":"desc"
				};
				selectedFilterService.set(filters);
				$state.go('org.collaboration',{
					orgId: $stateParams.orgId
				});
			};

			$scope.goToRejectedItems = function(){
				goToFilterdItems(itemService.ITEM_STATUS.REJECTED);
			};

			var onHttpGenericError  = function(httpResponse) {
				alert('Generic Error during server communication (error: ' + httpResponse.status + ' ' + httpResponse.statusText + ') ');
				$log.warn(httpResponse);
			};

			var getIfPriorityLaneManaged = function(cb) {
				kanbanizeService.query($stateParams.orgId,
					function(data) {
						if (data.apikey) {
							$scope.priorityManaged = true;
							$scope.lanesManaged = true;
							cb();
						} else {
							settingsService.get($stateParams.orgId).then(function(settings){
								$scope.priorityManaged = settings.manage_priorities === "1";
								$scope.lanesManaged = settings.manage_lanes === "1";
								cb();
							});
						}
					}
				);
			};

			//INIT
			getIfPriorityLaneManaged(function() {
				lanesService.get($stateParams.orgId).then(function (lanes) {
					$scope.lanes = lanes;
					//Manage organization without lane as organization with lane
					if (!$scope.lanesManaged) {
						$scope.kanbanItems[0] = {
							name: "Work Items",
							cols: {}
						};
					} else {
						lanes.push({
							lcid:"-1",
							lcname:"Items Without Lane"
						});
						lanes.forEach(function (lane) {
							if (lane.lcid !== null) {
								$scope.kanbanItems[lane.lcid] = {
									name: lane.lcname,
									cols: {}
								};
							}
						});
					}
					$scope.loadingItems = false;
					getItemForKanban();
				}, function (httpResponse) {
					onHttpGenericError(httpResponse);
					$scope.loadingItems = false;
				});
			});

		}]);
