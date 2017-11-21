angular.module('app.collaboration')
	.controller('ItemListController', [
		'$scope',
		'$log',
		'$interval',
		'$stateParams',
		'$mdDialog',
		'$mdToast',
		'streamService',
		'itemService',
		'$state',
		'voteExtractor',
		'kanbanizeLaneService',
		'selectedFilterService',
		function (
			$scope,
			$log,
			$interval,
			$stateParams,
			$mdDialog,
			$mdToast,
			streamService,
			itemService,
			$state,
			voteExtractor,
			kanbanizeLaneService,
			selectedFilterService) {

			$scope.menu = {
				open:false
			};

			$scope.currentUserId = $scope.identity.getId();
			$scope.decisions = $state.$current.data.decisions;
			$scope.changeUpdateTime = false;
			$scope.changeStatusTime = false;
			$scope.streams = null;
			$scope.lanes = null;
			$scope.isLoadingMore = false;
			$scope.loadingItems = true;
			$scope.sorting = "mostRecentEditAt_desc";

			$scope.filters = {
				offset: 0,
				limit: 20,
				status: "All",
				cardType: ($scope.decisions ? "decisions" : "all"),
				memberId: null,
				orderBy: 'mostRecentEditAt', //exeption for handle sort without break signature method
				orderType: ($scope.changeUpdateTime ? "asc" : "desc") //exeption for handle sort without break signature method
			};

			var sortingProps = {
				"mostRecentEditAt_desc": {orderBy: "mostRecentEditAt", orderType: "desc"},
				"mostRecentEditAt_asc": {orderBy: "mostRecentEditAt", orderType: "asc"},
				"position_desc": {orderBy: "position", orderType: "desc"},
				"position_asc": {orderBy: "position", orderType: "asc"}
			};

			var getFiltersWithSorting = function(filter, props){
				return _.extend(filter, props);
			};

			var getItems = function() {
				$scope.loadingItems = true;
				$scope.filters.offset = 0;
				itemService.query($stateParams.orgId, $scope.filters,
					function(data) {
						$scope.loadingItems = false;
						$scope.items = data;
					},
					function(response) {
						$scope.loadingItems = false;
						that.onLoadingError(response);
				});
			};

			if(selectedFilterService.get()){
				$scope.filters = _.extend($scope.filters, selectedFilterService.get());
				$scope.showFilter = true;
				$scope.showOrder = true;
				getItems();
			}

			$scope.loadMore = function() {
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
			};

			kanbanizeLaneService.getLanes($stateParams.orgId).then(function(lanes){
				$scope.lanes = lanes;
				$scope.lanesNames = [];

                lanes.forEach(function(lane) {
                    if (lane.lcid!==null) {
                        $scope.lanesNames[lane.lcid] = lane.lcname;
                    }
                });

				$scope.$watchGroup(['filters.status','filters.memberId','filters.orderType','filters.orderBy'],function(newValue,oldValue){
					if (newValue!=oldValue) {
						selectedFilterService.set($scope.filters);
						getItems();
					}
				});
				getItems();


			},function (httpResponse) {
				if(httpResponse.status === 500){
					alert('Generic Error during server communication');
				}
			});

			var onHttpGenericError  = function(httpResponse) {
				alert('Generic Error during server communication (error: ' + httpResponse.status + ' ' + httpResponse.statusText + ') ');
				$log.warn(httpResponse);
			};

			$scope.ITEM_STATUS = itemService.ITEM_STATUS;

			this.isAllowed = function(command, resource) {
				if(command == 'createStream') {
					return streamService.isAllowed(command, resource);
				}
				return itemService.isAllowed(command, resource);
			};
			this.getOwner = function(item) {
				var member = itemService.getOwner(item);
				return member;//$scope.user(member);
			};

			this.getAuthor = function(item) {
				var member = itemService.getAuthor(item);
				return member;//$scope.user(member);
			};

			this.checkImIn = function(item){
				return itemService.isIn(item,$scope.identity.getId());
			};

			/*this.loadItems = function() {
				$scope.filters.limit = 10;
				kanbanizeLaneService.getLanes($stateParams.orgId).then(function(lanes){
					$scope.lanes = lanes;
					$scope.lanesNames = [];
                    lanes.forEach(function(lane) {
                        if (lane.lcid!=null) {
                            $scope.lanesNames[lane.lcid] = lane.lcname;
                        }
                    });

                    itemService.query($stateParams.orgId, $scope.filters, function(data) { $scope.items = data; }, this.onLoadingError);
				});
			};*/

			$scope.printVote = function(item){
				return voteExtractor($scope.currentUserId,item);
			};

			
			/*this.stream = function(task) {
				if($scope.streams && task.stream) {
					return $scope.streams._embedded['ora:stream'][task.stream.id];
				}
				return null;
			};*/

			this.openNewItem = function(ev, decision, itemType) {
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
				}).then(this.onItemAdded);
			};

			this.onItemAdded = function(newItem){
				getItems();
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

			this.onLoadingError = function(error) {
				switch (error.status) {
					case 401:
						break;
				}
			};
			$scope.updateSorting = function(){
				$scope.filters = getFiltersWithSorting($scope.filters, sortingProps[$scope.sorting]);
			}

			$scope.goToDetail = function($event,item){
				$event.preventDefault();
				$event.stopPropagation();
				$state.go("org.item",{ orgId: item.organization.id, itemId: item.id });
			};

			$scope.showPriority = function(item){
				return item.status == itemService.ITEM_STATUS.OPEN && !_.isNull(item.position);
			};

		}]);
