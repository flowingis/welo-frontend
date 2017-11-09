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
			$q) {

			$scope.menu = {
				open:false
			};
			$scope.closeLeft();

			//$scope.currentUserId = $scope.identity.getId();
			//$scope.changeUpdateTime = false;
			//$scope.changeStatusTime = false;
			//$scope.streams = null;
			$scope.lanes = null;
			//$scope.isLoadingMore = false;
			$scope.loadingItems = true;
			$scope.ITEM_STATUS = itemService.ITEM_STATUS;

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
				//getItems();
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

			var getItemForStatus = function(stateId) {
				var deferred = $q.defer();
				var filters = {
					/*offset: 0,
					limit: 20,*/
					status: stateId,
					cardType: "All",
					memberId: null,
					orderBy: 'position', 
					orderType: "desc"
				}
				itemService.query($stateParams.orgId, filters,
					function(data) {
						$log.info("STATO:"+stateId);
						$log.info(data);
						deferred.resolve();
					},
					function(response) {
						that.onLoadingError(response);
						deferred.reject();
					});
				return deferred.promise;	
			}


			var getItemForKanban = function() {
				$scope.loadingItems = true;

				$log.info($scope.ITEM_STATUS);
				//LEGGIAMO LE IDEAS
				getItemForStatus($scope.ITEM_STATUS.IDEA).then(function(){
					getItemForStatus($scope.ITEM_STATUS.OPEN).then(function() {
						$scope.loadingItems = false;
					})
				})
			};
            

  
			/* $scope.loadMore = function() {
				$scope.loadingItems = true;
				$scope.filters.offset = $scope.items._embedded['ora:task'].length;
				itemService.query($stateParams.orgId, $scope.filters,
					function(data) {
						$scope.isLoadingMore = false;
						$scope.loadingItems = false;
						$scope.items._embedded['ora:task'] = $scope.items._embedded['ora:task'].concat(data._embedded['ora:task']);
					},
					function(response) {
						$scope.isLoadingMore = false;
						$scope.loadingItems = false;
						that.onLoadingError(response);
				});
			}; */

			/* var onHttpGenericError  = function(httpResponse) {
				alert('Generic Error during server communication (error: ' + httpResponse.status + ' ' + httpResponse.statusText + ') ');
				$log.warn(httpResponse);
			}; */

			

			
			/* this.getOwner = function(item) {
				var member = itemService.getOwner(item);
				return member;//$scope.user(member);
			}; */

			/* this.getAuthor = function(item) {
				var member = itemService.getAuthor(item);
				return member;//$scope.user(member);
			}; */

			/* this.checkImIn = function(item){
				return itemService.isIn(item,$scope.identity.getId());
			}; */


			/* this.openEstimateItem = function(ev, item) {
				$mdDialog.show({
					controller: EstimateItemController,
					controllerAs: 'dialogCtrl',
					templateUrl: 'app/collaboration/partials/estimate-item.html',
					targetEvent: ev,
					clickOutsideToClose: true,
					locals: {
						item: item,
						prevEstimation: item.members[$scope.identity.getId()].estimation
					}
				}).then(this.updateItem);
			}; */

			/* this.openAssignShares = function(ev, item) {
				$mdDialog.show({
					controller: AssignSharesController,
					controllerAs: 'dialogCtrl',
					templateUrl: 'app/collaboration/partials/assign-shares.html',
					targetEvent: ev,
					clickOutsideToClose: true,
					scope: $scope.$new(),
					locals: {
						item: item
					}
				}).then(this.updateItem);
			};
 */
			/* this.addStream = function(stream) {
				$scope.streams._embedded['ora:stream'][stream.id] = stream;
				$mdToast.show(
					$mdToast.simple()
						.textContent('New stream "' + stream.subject + '" added')
						.position('bottom left')
						.hideDelay(3000)
				);
			}; */

			/* this.addItem = function(item) {
				$scope.items._embedded['ora:task'].unshift(item);
			}; */

			/* this.updateItem = function(item) {
				var items = $scope.items._embedded['ora:task'];
				for(var i = 0; i < items.length; i++) {
					if(items[i].id == item.id) {
						items[i] = item;
						break;
					}
				}
			}; */
			/* this.joinItem = function(item) {
				itemService.joinItem(item, this.updateItem, onHttpGenericError);
			}; */
			/* this.unjoinItem = function(item) {
				itemService.unjoinItem(item, this.updateItem, onHttpGenericError);
			}; */
			/* this.isNewEntitiesAllowed = function(organization) {
				return itemService.isAllowed('createItem', organization) ||
								streamService.isAllowed('createStream', organization);
			}; */
			/* this.hasActions = function(item) {
				return this.isAllowed('joinItem', item) ||
						this.isAllowed('estimateItem', item) ||
						this.isAllowed('assignShares', item)|| this.isAllowed('approveIdea', item);
			}; */

			/* this.onLoadingError = function(error) {
				switch (error.status) {
					case 401:
						break;
				}
			}; */
			/* this.invertStatusTime = function() {
				$scope.changeStatusTime = !$scope.changeStatusTime;
			}; */

			/* $scope.goToDetail = function($event,item){
				$event.preventDefault();
				$event.stopPropagation();
				$state.go("org.item",{ orgId: item.organization.id, itemId: item.id });
			}; */

			/* $scope.goToProfile = function($event,ownerId){
				$event.preventDefault();
				$event.stopPropagation();
				$state.go("org.profile",{ memberId: ownerId });
			}; */

			/* $scope.showPriority = function(item){
				return item.status == itemService.ITEM_STATUS.OPEN && !_.isNull(item.position);
			}; */

			//INIT
			kanbanizeLaneService.getLanes($stateParams.orgId).then(function (lanes) {
				$scope.lanes = lanes;
				$scope.lanesNames = [];

				lanes.forEach(function (lane) {
					if (lane.lcid !== null) {
						$scope.lanesNames[lane.lcid] = lane.lcname;
					}
				});

				//Manage organization without lane as organization with lane
				if (!lanes.length) {
					$scope.lanes = [{
						lcid: 0,
						lcname: "Kanban"
					}];
				}

				//$scope.$watchGroup(['filters.status','filters.memberId','filters.orderType'],function(newValue,oldValue){
				//	if (newValue!=oldValue) {
				//		getItems();
				//	}
				//});
				//getItems();
				$scope.loadingItems = false;
				getItemForKanban();


			}, function (httpResponse) {
				if (httpResponse.status === 500) {
					alert('Generic Error during server communication');
				}
			});


		}]);
