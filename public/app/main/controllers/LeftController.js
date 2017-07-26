angular.module('app')
	.controller('LeftController', function ($scope, $mdSidenav, $log, identity, $location, cronService, $mdDialog) {

		$scope.goProfilePage = function () {
			console.log(identity.getId());
			console.log($scope.identity.getId());
		};

		console.log(identity.getEmail());
		console.log($location.host());

		$scope.showForceCron = false;
		if (($location.host() == "localhost") || 
			($location.host() == "127.0.0.1") || 
		($location.host() == "welo.ideato.it")) {
			$scope.showForceCron = true;
		}

		var allowedMailForceCron = ['stelio@cocoon-pro.com','lorenzo.pomili85@gmail.com','marco.radossi@gmail.com','l.massacci@e-xtrategy.it','lorenzomassacci@gmail.com','marco.radossi@ideato.info','michele.orselli@gmail.com','michele.orselli@ideato.info'];

		$scope.canshowForceCron = function() {
			if ($scope.showForceCron) {
				if (identity.getEmail()) {
					return (_.indexOf(allowedMailForceCron,identity.getEmail())>-1);
				} else {
					return false;
				}
			} else {
				return false;
			}
		}


		$scope.close = function () {
			$mdSidenav('left').close()
				.then(function () {
					$log.debug("close LEFT is done");
				});
		};

		$scope.forceCron = function() {
			var modale = $mdDialog.show({
    				contentElement: '#cronLoadingStatus',
					parent: angular.element(document.body),
					escapeToClose: false,
					clickOutsideToClose: false
  				});
			cronService.force().then(function(response) {
				$mdDialog.hide();
				var result = $mdDialog.alert()
					.title("CRON")
					.htmlContent("<pre>"+response.data.result+"</pre>")
					.ok("Close");
				$mdDialog.show(result);
			});
		};

		$scope.ver = ver;
		$scope.t = t;
});