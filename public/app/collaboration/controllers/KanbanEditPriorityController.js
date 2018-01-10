angular.module('app.collaboration')
	.controller('KanbanEditPriorityController', [
		'$scope',
		'$log',
		'$stateParams',
		'$mdDialog',
		'$mdToast',
		'streamService',
		'itemService',
		'sortedItemsService',
		'$state',
		'kanbanizeLaneService',
		'$q',
		function (
			$scope,
			$log,
			$stateParams,
			$mdDialog,
			$mdToast,
			streamService,
			itemService,
			sortedItemsService,
			$state,
			kanbanizeLaneService,
			$q) {

			$scope.getSortedItems = function(id, sortedItems){
				sortedItemsService.set(id, sortedItems);
			};

			$scope.menu = {
				open:false
			};
			$scope.closeLeft();

			  $mdDialog.show(
				$mdDialog.alert()
				  .clickOutsideToClose(true)
				  .title('Change Open Item Priority')
				  .htmlContent('<strong>Click an item</strong> to move it and then click on the new position.<br><strong>Remember to SAVE</strong> before to close the page.')
				  .ok('Got it!')
			  );

			$scope.currentUserId = $scope.identity.getId();
			$scope.lanes = null;
			$scope.selectedLane = undefined;
			$scope.loadingItems = true;
			$scope.ITEM_STATUS = itemService.ITEM_STATUS;
			$scope.kanbanItems = {};

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
							if (idlane!=="0") {
								lane.cols[stateId] = _.filter(data._embedded['ora:task'],function(item) {
									if (item.lane == idlane) {
										return true;
									} else {
										return false;
									}
								});
							} else {
								lane.cols[stateId] = data._embedded['ora:task'];
							}

						});
						deferred.resolve(kanbanItems);
					},
					function(response) {
						deferred.reject(response);
					});
				return deferred.promise;
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
									});
								});
							});
						});
					});
				}, function(response){
					onHttpGenericError(response);
				});

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

			$scope.setSelectLane = function(idLane){
				$scope.selectedLane = idLane;
			};

			$scope.unsetSelectLane = function(idLane){
				$scope.selectedLane = undefined;
			};

		}]);
