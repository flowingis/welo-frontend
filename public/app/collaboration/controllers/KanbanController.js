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
		'kanbanizeLaneService',
		'selectedFilterService',
		'$q',
		function (
			$scope,
			$log,
			$stateParams,
			$mdDialog,
			$mdToast,
			streamService,
			itemService,
			$state,
			kanbanizeLaneService,
			selectedFilterService,
			$q) {

			$scope.menu = {
				open:false
			};
			$scope.closeLeft();

			$scope.currentUserId = $scope.identity.getId();
			$scope.lanes = null;
			$scope.loadingItems = true;
			$scope.ITEM_STATUS = itemService.ITEM_STATUS;
			$scope.kanbanItems = {};

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
						orgId: $stateParams.orgId,
						streams: [$scope.stream],
						decisionMode: decision,
						lanes: $scope.lanes,
						itemType: itemType
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
									if (!item.lane) {
										return true;
									} else {
										return false;
									}
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
					getItemForStatus($scope.ITEM_STATUS.OPEN,kanbanItems).then(function() {
						getItemForStatus($scope.ITEM_STATUS.ONGOING,kanbanItems).then(function() {
							getItemForStatus($scope.ITEM_STATUS.COMPLETED,kanbanItems).then(function() {
								getItemForStatus($scope.ITEM_STATUS.ACCEPTED,kanbanItems).then(function() {
									getItemForStatus($scope.ITEM_STATUS.CLOSED,kanbanItems).then(function() {
										$scope.loadingItems = false;
										$scope.kanbanItems = kanbanItems;
										$scope.kanbanItems = removeLaneIfIsEmpty($scope.kanbanItems, "-1");
									});
								});
							});
						});
					});
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

			//INIT
			kanbanizeLaneService.getLanes($stateParams.orgId).then(function (lanes) {
				$scope.lanes = lanes;
				//Manage organization without lane as organization with lane
				if (!lanes.length) {
					$scope.kanbanItems[0] = {
						name: "Work Items",
						cols: {}
					};
				} else {
					$scope.kanbanItems[-1] = {
						name: "Items Without Lane",
						cols: {}
					};
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


		}]);
