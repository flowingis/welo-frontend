angular.module('app.collaboration')
	.controller('ItemDetailController', [
		'$scope',
		'$state',
		'$stateParams',
		'$mdDialog',
		'$log',
		'streamService',
		'itemService',
		'kanbanizeLaneService',
		'identity',
		'voteExtractor',
		function (
			$scope,
			$state,
			$stateParams,
			$mdDialog,
			$log,
			streamService,
			itemService,
			kanbanizeLaneService,
			identity,
			voteExtractor) {

			var onHttpGenericError = function (httpResponse) {
				alert('Generic Error during server communication (error: ' + httpResponse.status + ' ' + httpResponse.statusText + ') ');
				$log.warn(httpResponse);
				$scope.loading = false;
			};

			$scope.attachments = [];

			$scope.suggest = '';

			$scope.myId = identity.getId();

			$scope.busy = true;
			$scope.loading = false;

			$scope.history = [];

			$scope.lanes = [];
			$scope.loading = true;
			kanbanizeLaneService.getLanes($stateParams.orgId).then(function (lanes) {
				lanes.forEach(function (lane) {
					if (lane.lcid !== null) {
						$scope.lanes[lane.lcid] = lane.lcname;
					}
				});
				$scope.loading = false;
			});

			this.iVoted = function (elm) {
				var messageFromVoteExtractor = voteExtractor($scope.myId, elm);

				if (messageFromVoteExtractor) {
					$scope.suggest = messageFromVoteExtractor;
					return true;
				}

				if (elm.status === 40) {
					if (elm.members[$scope.myId] && elm.members[$scope.myId].shares) {
						if (elm.members[$scope.myId].shares.hasOwnProperty($scope.myId)) {
							$scope.suggest = "You have just assigned shares";
						}
						return true;
					}
				}

				if (elm.status === 50) {
					$scope.suggest = "This item has been closed";
					return true;
				}

				$scope.suggest = '';
				return false;
			};

			var onLoadItem = function (data) {
				$scope.author = itemService.getAuthor(data);
				$scope.owner = itemService.getOwner(data);
				$scope.yourEstimation = itemService.yourEstimation(data);
				$scope.item = data;
				$scope.busy = false;
				$scope.attachments = data.attachments || [];
				$scope.members = _.values(data.members);

				$scope.item.laneName = ($scope.item.lane && $scope.item.lane.length) ? $scope.lanes[$scope.item.lane] : '';

				itemService.getHistory($scope.item).then(function (response) {
					$scope.history = response.data;
					$scope.loading = false;
				}, onHttpGenericError);
			};

			$scope.membershipRole = $scope.identity.getMembershipRole($stateParams.orgId);

			$scope.goToProfile = function (id) {
				$state.go("org.profile", { memberId: id });
			};

			$scope.streams = null;
			$scope.loading = true;
			streamService.query($stateParams.orgId, function (data) { 
				$scope.streams = data;
				$scope.loading = false;
			 }, onHttpGenericError);
			
			this.onLoadingError = function (error) {
				$log.debug(error);
				switch (error.status) {
					/*case 401:
						itemService.stopGetPolling();
						break;*/
					default:
						alert('Generic Error during server communication (error: ' + httpResponse.status + ' ' + httpResponse.statusText + ') ');
						$log.warn(httpResponse);
				}
				$scope.loading = false;
			};

			$scope.item = null;
			$scope.ITEM_STATUS = itemService.ITEM_STATUS;

			$scope.loading = true;
			itemService.get($stateParams.orgId, $stateParams.itemId, onLoadItem, this.onLoadingError);

			this.stream = function (item) {
				if ($scope.streams && item && item.stream) {
					return $scope.streams._embedded['ora:stream'][item.stream.id];
				}
				return null;
			};
			this.isAllowed = itemService.isAllowed.bind(itemService);
			this.hasMore = function (item) {
				return this.isAllowed('backToIdea', item) ||
					this.isAllowed('deleteItem', item) || 
					this.isAllowed('backToOpen', item) || 
					this.isAllowed('backToOngoing', item);
			};
			this.parseDate = function (when) {
				return Date.parse(when);
			};
			this.openEditItem = function (ev, item) {
				$mdDialog.show({
					controller: EditItemController,
					controllerAs: 'dialogCtrl',
					templateUrl: 'app/collaboration/partials/edit-item.html',
					targetEvent: ev,
					clickOutsideToClose: true,
					locals: {
						task: item
					}
				}).then(this.updateItem);
			};

			var originatorEv;
			this.openMenu = function ($mdMenu, ev) {
				originatorEv = ev;
				$mdMenu.open(ev);
			};

			this.deleteItem = function (ev, item) {
				var confirm = $mdDialog.confirm()
					.title("Would you delete this item?")
					.textContent("It removes all its informations and cannot be undone.")
					.targetEvent(ev)
					.ok("Yes")
					.cancel("No");

				$mdDialog.show(confirm).then(function () {
					$scope.loading = true;
					itemService.delete(item,
						function () {
							$scope.loading = false;
							$state.go('org.collaboration', { orgId: item.organization.id });
						},
						onHttpGenericError
					);
				});

				originatorEv = null;
			};

			this.backToIdea = function (ev, item) {
				var confirm = $mdDialog.confirm()
					.title("Do you really want to take this item back to the \"Idea\" stage?")
					.textContent("Please be careful: this action would remove all of its information and cannot be undone.")
					.targetEvent(ev)
					.ok("Yes")
					.cancel("No");

				$mdDialog.show(confirm).then(function () {
					itemService.backToIdea(item,
						function () {
							$state.go('org.collaboration', { orgId: item.organization.id });
						},
						onHttpGenericError
					);
				});

				originatorEv = null;
			};
			
			this.backToOpen = function (ev, item) {
				var confirm = $mdDialog.confirm()
					.title("Do you really want to take this item back to the \"Open\" stage?")
					.textContent("Please be careful: this action would remove all of its information and cannot be undone.")
					.targetEvent(ev)
					.ok("Yes")
					.cancel("No");

				$mdDialog.show(confirm).then(function () {
					itemService.backToOpen(item,
						function () {
							$state.go('org.collaboration', { orgId: item.organization.id });
						},
						onHttpGenericError
					);
				});

				originatorEv = null;
			};
			
			this.backToOngoing = function (ev, item) {
				var confirm = $mdDialog.confirm()
					.title("Do you really want to take this item back to the \"Ongoing\" stage?")
					.textContent("Please be careful: this action would remove all of its information and cannot be undone.")
					.targetEvent(ev)
					.ok("Yes")
					.cancel("No");

				$mdDialog.show(confirm).then(function () {
					itemService.backToOngoing(item,
						function () {
							$state.go('org.collaboration', { orgId: item.organization.id });
						},
						onHttpGenericError
					);
				});

				originatorEv = null;
			};

			this.joinItem = function (item) {
				$scope.loading = true;
				itemService.joinItem(item, this.updateItem, onHttpGenericError);
			};
			this.unjoinItem = function (item) {
				$scope.loading = true;
				itemService.unjoinItem(item, this.updateItem, onHttpGenericError);
			};
			this.openEstimateItem = function (ev, item) {
				var that = this;
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
				}).then(function() {
					$scope.loading = true;
					that.updateItem();
				});
			};
			this.executeItem = function (ev, item) {
				var that = this;

				var confirm = $mdDialog.confirm()
					.title("ARE YOU STARTING THIS WORK ITEM?")
					.textContent("You are about to start the activities on this work item, becoming its \"owner\". This means you are willing to coordinate and facilitate its work, while other users can join you in this effort. Do you confirm?")
					.targetEvent(ev)
					.ok("YES, I DO!")
					.cancel("NOT NOW");

				var alertBlockPtiorityCheck = $mdDialog.alert()
					.title("ATTENTION")
					.textContent("You can't start this item because there are items with higher priority")
					.targetEvent(ev)
					.ok("Close");

				var confirmPriorityCheck = $mdDialog.confirm()
					.htmlContent("<p class=\"md-title warn\">WARNING: ARE YOU STARTING THIS WORK ITEM EVEN IF IT IS NOT THE ONE WITH TOP PRIORITY?</p><p>You are about to start the activities on this work item, becoming its \"owner\", even though there is another one with higher priority. This means you are willing to coordinate and facilitate the work on this item, while other users can join you in this effort. Do you confirm?</p>")
					.targetEvent(ev)
					.ok("YES, I DO!")
					.cancel("NOT NOW");

				if (item.position > 2) {
					$mdDialog.show(alertBlockPtiorityCheck);
				} else if (item.position === 2) {
					$mdDialog.show(confirmPriorityCheck)
						.then(function () {
							$scope.loading = true;
							itemService.executeItem(item, that.updateItem, onHttpGenericError);
						});
				} else {	
					$mdDialog.show(confirm)
						.then(function () {
							$scope.loading = true;
							itemService.executeItem(item, that.updateItem, onHttpGenericError);
						});
				}
			};
			/*this.reExecuteItem = function (ev, item) {
				var that = this;
				var confirm = $mdDialog.confirm()
					.title("Would you revert this item to ongoing?")
					.textContent("Organization members can join, item members can unjoin or change their estimates.")
					.targetEvent(ev)
					.ok("Yes")
					.cancel("No");

				$mdDialog.show(confirm)
					.then(function () {
						that.executeItem(item);
					});
			};*/
			this.completeItem = function (ev, item) {
				var that = this;
				var confirm = $mdDialog.confirm()
					.title("Would you mark this item as completed?")
					.textContent("It freezes item members and their estimation.")
					.targetEvent(ev)
					.ok("Yes")
					.cancel("No");

				$mdDialog.show(confirm)
					.then(function () {
						that.reCompleteItem(item);
					});
			};
			this.reCompleteItem = function (item) {
				$scope.loading = true;
				itemService.completeItem(item, this.updateItem, onHttpGenericError);
			};
			this.acceptItem = function (ev, item) {
				var that = this;
				$mdDialog.show({
					controller: ApproveIdeaController,
					controllerAs: 'dialogCtrl',
					templateUrl: 'app/collaboration/partials/approve-item.html',
					targetEvent: ev,
					clickOutsideToClose: true,
					locals: {
						title: 'Accept Item',
						item: item,
						callbacks: {
							abstain: itemService.abstainCompletedItem,
							accept: itemService.approveCompletedItem,
							reject: itemService.rejectCompletedItem
						}
					}
				}).then(function () {
					$scope.loading = true;
					that.updateItem();
				});
			};
			this.openAssignShares = function (ev, item) {
				var that = this;
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
				}).then(function () {
					$scope.loading = true;
					that.updateItem();
				});
			};

			this.removeTaskMember = function (ev, item, member) {
				var confirm = $mdDialog.confirm()
					.title("Would you remove this user from the task?")
					.textContent("This operation cannot be undone.")
					.targetEvent(ev)
					.ok("Yes")
					.cancel("No");

				$mdDialog.show(confirm).then(function () {
					$scope.loading = true;
					itemService.removeTaskMember(item.organization.id, item.id, member.id).then(function(response) {
						$log.info(response);
						$scope.loading = false;
						}, onHttpGenericError);
				});
			};

			this.openApproveIdea = function (ev, item) {
				var that = this;
				$mdDialog.show({
					controller: ApproveIdeaController,
					controllerAs: 'dialogCtrl',
					templateUrl: 'app/collaboration/partials/approve-item.html',
					targetEvent: ev,
					clickOutsideToClose: true,
					locals: {
						title: 'Approve Idea',
						item: item,
						callbacks: {
							abstain: itemService.abstainIdeaItem,
							accept: itemService.approveIdeaItem,
							reject: itemService.rejectIdeaItem
						}
					}
				}).then(function () {
					$scope.loading = true;
					that.updateItem();
				});
			};

			/*this.remindItemEstimate = function (item) {
				$scope.loading = true;
				itemService.remindItemEstimate(item, function(response) {
						$log.info(response);
						$scope.loading = false;
						}, onHttpGenericError);
			};*/

			this.updateItem = function (item) {
				$scope.loading = true;
				itemService.get($stateParams.orgId, $stateParams.itemId, onLoadItem, this.onLoadingError);
			};

			this.closeItem = function (item) {
				$scope.loading = true;
				itemService.closeItem(item, this.updateItem, onHttpGenericError);
			};

			this.addAttachment = function (file) {
				$scope.loading = true;
				$scope.attachments.push(file);
				itemService.setAttachments($stateParams.orgId, $stateParams.itemId, $scope.attachments).then(function(response) {
						$log.info(response);
						$scope.loading = false;
						}, onHttpGenericError);
			};

			this.deleteAttachment = function (file) {
				$scope.loading = true;
				$scope.attachments = _.without($scope.attachments, file);
				itemService.setAttachments($stateParams.orgId, $stateParams.itemId, $scope.attachments).then(function(response) {
						$log.info(response);
						$scope.loading = false;
						}, onHttpGenericError);
			};

			$scope.showPriority = function (item) {
				return item.status == itemService.ITEM_STATUS.OPEN && !_.isNull(item.position);
			};

			var that = this;

			this.changeOwner = function (ev, item) {
				$mdDialog.show({
					controller: 'ChangeOwnerController',
					templateUrl: 'app/collaboration/partials/change-owner.html',
					targetEvent: ev,
					clickOutsideToClose: true,
					locals: {
						item: item,
						owner: $scope.owner
					}
				}).then(function (owner) {
					$scope.loading = true;
					itemService.changeOwner(item, owner).then(function () {
						//itemService.query($stateParams.orgId, $stateParams.itemId, onLoadItem);
						itemService.get($stateParams.orgId, $stateParams.itemId, onLoadItem, this.onLoadingError);
					}, onHttpGenericError);
				});
			};
		}]);
