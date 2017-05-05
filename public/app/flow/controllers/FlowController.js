angular.module('app.flow')
	.controller('FlowController', [
		'$scope',
		'$log',
		'$interval',
		'$stateParams',
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

			$scope.filters = {
					limit: 10,
					offset: 0
				};
			$scope.cards = {
				_embedded: {
				}
			};
			$scope.isLoadingMore = false;
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

			var updatedCards = function(oldDatas, newDatas){
				var newCards = _.extend({}, newDatas);
				var arraOfNewCard = FlowItemsTools.objToArray(newDatas._embedded['ora:flowcard']);
				newCards._embedded['ora:flowcard'] = FlowItemsTools.merge(oldDatas._embedded['ora:flowcard'], arraOfNewCard).items;
				return newDatas;
			}

			$scope.loading = true;
			flowService.startQueryPolling($scope.filters, function(data) {
				$scope.loading = false;
				$scope.cards = updatedCards($scope.cards, data);
			}, this.onLoadingError, 10000);

			this.cancelAutoUpdate = function() {
				flowService.stopQueryPolling();
			};
			$scope.$on("$destroy", function(){
				that.cancelAutoUpdate();
			});
			$scope.loadMore = function() {
				that.cancelAutoUpdate();
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
