angular.module('app.flow')
	.controller('FlowController', [
		'$scope',
		'$log',
		'$interval',
		'$stateParams',
		'$mdToast',
		'flowService',
		'$state',
		'SelectedOrganizationId',
		'FlowItemsTools',
		'streamService',
		function (
			$scope,
			$log,
			$interval,
			$stateParams,
			$mdToast,
			flowService,
			$state,
			SelectedOrganizationId,
			FlowItemsTools,
			streamService) {
			if(SelectedOrganizationId.get()){
				streamService.query(SelectedOrganizationId.get(),function(data){
					$scope.stream = _.values(data._embedded['ora:stream'])[0];
				},function(){
					$state.go("organizations");
					return;
				});

			}else{
				$state.go("organizations");
				return;
			}

			var initFilters = function(){
				$scope.filters = {
					limit: 10,
					offset: 0
				};
			};

			var init = function(){
				initFilters();
				$scope.defaultFilters = _.extend({}, $scope.filters);
				$scope.cards = {
					_embedded: {
					}
				};
				$scope.isLoadingMore = false;
				$scope.loading = true;
				$scope.pollingStopped = false;
				$scope.showPollingResult = true;
				$scope.startPolling();
			};

			var that = this;
			this.onLoadingError = function(error) {
				$scope.loading = false;
				switch (error.status) {
					case 401:
						that.cancelAutoUpdate();
						break;
					default:
						that.cancelAutoUpdate();
						alert('Generic Error during server communication (error: ' + error.status + ' ' + error.statusText + ') ');
						$log.warn(error);
				}
			};

			var hadNewCards = function(oldDatas, newDatas){
				var arraOfNewCard = FlowItemsTools.objToArray(newDatas._embedded['ora:flowcard']);
				return FlowItemsTools.merge(oldDatas._embedded['ora:flowcard'], arraOfNewCard).hadNewItems;
			};

			var updatedCards = function(oldDatas, newDatas){
				var newCards = _.extend({}, newDatas);
				var arraOfNewCard = FlowItemsTools.objToArray(newDatas._embedded['ora:flowcard']);
				newCards._embedded['ora:flowcard'] = FlowItemsTools.merge(oldDatas._embedded['ora:flowcard'], arraOfNewCard).items;
				return newDatas;
			};
			
			var refresh = function(){
				that.cancelAutoUpdate();
				init();
			};

            var newItemsAvailable = function() {
                // var containerEl = angular.element(".toast_container");
                var toast = $mdToast.simple()
                    .textContent('YOU HAVE NEW ITEMS')
                    .hideDelay(0)
                    .action('SHOW')
                    .highlightAction(true)
                    .position("top center");
                    // .parent(containerEl);

                $mdToast.show(toast).then(function(response) {
                    if(response === 'ok'){
                        $mdToast.hide();
                        refresh();
                    }
                });
            };

            $scope.startPolling = function(){
                flowService.startQueryPolling($scope.defaultFilters, function(data) {
                    $scope.loading = false;
                    if($scope.showPollingResult){
                        $scope.cards = updatedCards($scope.cards, data);
                    }else{
                        if(hadNewCards($scope.cards, data)){
                            that.cancelAutoUpdate();
                            newItemsAvailable();     
                        }
                    }
                }, this.onLoadingError, 10000);
            };

            init();

			this.cancelAutoUpdate = function() {
				flowService.stopQueryPolling();
			};
			$scope.$on("$destroy", function(){
				that.cancelAutoUpdate();
			});

			this.pausePolling = function(){
				$scope.showPollingResult = false;
			};

			$scope.loadMore = function() {
				that.pausePolling();
				$scope.pollingStopped = true;
				$scope.isLoadingMore = true;
				$scope.filters.offset = $scope.cards._embedded['ora:flowcard'].length;
				flowService.query($scope.filters,
						function(data) {
							$scope.isLoadingMore = false;
							$scope.cards = updatedCards($scope.cards, data);
						},
						function(response) {
							$scope.isLoadingMore = false;
							that.onLoadingError(response);
				});
			};

			this.route = function(card, hierarchy) {

				if (card.content.actions[hierarchy].orgId && card.content.actions[hierarchy].itemId) {
					$state.go('org.item', {
						orgId: card.content.actions[hierarchy].orgId,
						itemId: card.content.actions[hierarchy].itemId
					});
				}

				if (card.content.actions[hierarchy].orgId && card.content.actions[hierarchy].userId) {
					$state.go('org.profile', {
						orgId: card.content.actions[hierarchy].orgId,
						memberId: card.content.actions[hierarchy].userId
					});
				}
			};
		}]);
