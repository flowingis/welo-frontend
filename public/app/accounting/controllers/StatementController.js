angular.module('app.accounting')
	.controller('StatementController', [
        '$scope',
        '$stateParams',
        'accountService',
        'downloadFileService',
        '$state',
        '$interval',
		'$mdDialog',
		function (
            $scope,
            $stateParams,
            accountService,
            downloadFileService,
            $state,
            $interval,
			$mdDialog) {

			$scope.menu = {
				open:false
			};

			$scope.selectedTab = $state.$current.data.currentTab;

			this.isAllowed = accountService.isAllowed.bind(accountService);

			this.onLoadingError = function(error) {
				switch (error.status) {
					case 401:
						break;
				}
			};

			$scope.filters = {
			};

			$scope.statement = null;

			$scope.emptyOrganizationTransactions = false;
			$scope.loadingOrganizationTransactions = true;
			accountService.organizationStatement($stateParams.orgId, $scope.filters, function(data) {
				$scope.loadingOrganizationTransactions = false;
				var transactions = data._embedded.transactions || [];
				if(transactions.length === 0){
					$scope.emptyOrganizationTransactions = true;
				}
				$scope.statement = data;
			}, function(error){
				this.onLoadingError(error);
				$scope.loadingOrganizationTransactions = false;
			});

			$scope.personalStatement = null;
			$scope.emptyPersonalTransactions = false;
			$scope.loadingPersonalTransactions = true;
			var getPersonalStats = function(){
				accountService.fullPersonalStats($stateParams.orgId, {}).then(function(data){
					$scope.myWallet = data.userStats;
					$scope.loadingPersonalTransactions = false;
					var transactions = data.personalStatement._embedded.transactions || [];
					if(transactions.length === 0){
						$scope.emptyPersonalTransactions = true;
					}
					$scope.personalStatement = data.personalStatement;
				}).catch(function(error){
					this.onLoadingError(error);
					$scope.loadingPersonalTransactions = false;
				});
			};
			getPersonalStats();

			$scope.isLoadingMore = false;
			this.loadMore = function() {
				$scope.isLoadingMore = true;

				var filters = {
					limit:$scope.statement.count + 10
				};

				var that = this;

				accountService.organizationStatement($stateParams.orgId, filters,
						function(data) {
							$scope.isLoadingMore = false;
							$scope.statement = data;
						},
						function(response) {
							$scope.isLoadingMore = false;
							that.onLoadingError(response);
						});
			};

			$scope.statementExport = function(){
				accountService.getStatementExport($stateParams.orgId).then(function(data){
					// downloadFileService(csv, "credits", ".csv");
				});
			};

			$scope.isLoadingMorePersonal = false;
			this.loadMorePersonal = function() {
				$scope.isLoadingMorePersonal = true;

				var filters = {
					limit:$scope.personalStatement.count + 10
				};

				var that = this;
				accountService.fullPersonalStats($stateParams.orgId, filters).then(function(data){
					$scope.isLoadingMorePersonal = false;
					$scope.personalStatement = data.personalStatement;
				}).catch(function(error){
					$scope.isLoadingMorePersonal = false;
					that.onLoadingError(error);
				});
			};

			$scope.addTransaction = function(transaction) {
				$scope.statement._embedded.transactions.unshift(transaction);
				getPersonalStats();
			};

			this.openNewDeposit = function(ev) {
				$mdDialog.show({
					controller: NewDepositController,
					controllerAs: 'dialogCtrl',
					templateUrl: "app/accounting/partials/new-deposit.html",
					targetEvent: ev,
					clickOutsideToClose: true,

					locals: {
						account: $scope.statement
					}
				}).then($scope.addTransaction);
			};
			this.openNewWithdrawal = function(ev) {
				$mdDialog.show({
					controller: NewWithdrawalController,
					controllerAs: 'dialogCtrl',
					templateUrl: "app/accounting/partials/new-withdrawal.html",
					targetEvent: ev,
					clickOutsideToClose: true,

					locals: {
						account: $scope.statement
					}
				}).then($scope.addTransaction);
			};
			this.openNewIncomingTransfer = function(ev) {
				$mdDialog.show({
					controller: NewIncomingTransferController,
					controllerAs: 'dialogCtrl',
					templateUrl: "app/accounting/partials/new-incoming-transfer.html",
					targetEvent: ev,
					clickOutsideToClose: true,

					locals: {
						account: $scope.statement
					}
				}).then(function(data) {
					for(var i = 0; i < data._embedded['ora:transaction'].length; i++) {
						var transaction = data._embedded['ora:transaction'][i];
						if(transaction.account.id == $scope.statement.id) {
							$scope.addTransaction(transaction);
							return;
						}
					}
				});
			};
			this.openNewOutgoingTransfer = function(ev) {
				$mdDialog.show({
					controller: NewOutgoingTransferController,
					controllerAs: 'dialogCtrl',
					templateUrl: "app/accounting/partials/new-outgoing-transfer.html",
					targetEvent: ev,
					clickOutsideToClose: true,

					locals: {
						account: $scope.statement
					}
				}).then(function(data) {
					for(var i = 0; i < data._embedded['ora:transaction'].length; i++) {
						var transaction = data._embedded['ora:transaction'][i];
						if(transaction.account.id == $scope.statement.id) {
							$scope.addTransaction(transaction);
							return;
						}
					}
				});
			};
			this.isNewTransactionsAllowed = function() {
				if(!$scope.statement){
					return false;
				}

				return $scope.statement._links['ora:deposit'] ||
				 	   $scope.statement._links['ora:withdrawal'] ||
                	   $scope.statement._links['ora:incoming-transfer'] ||
				       $scope.statement._links['ora:outgoing-transfer'];
			};
		}]);
