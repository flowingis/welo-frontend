angular.module('app')
	.controller('LeftController', function ($scope, $mdSidenav, $log, identity) {

		$scope.goProfilePage = function () {
			console.log("PRVA");
			console.log(identity.getId());
			console.log($scope.identity.getId());
		};


		$scope.close = function () {
			$mdSidenav('left').close()
				.then(function () {
					$log.debug("close LEFT is done");
				});
		};

		$scope.ver = ver;
		$scope.t = t;
});