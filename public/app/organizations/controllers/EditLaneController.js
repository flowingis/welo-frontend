function EditLaneController($scope, $mdDialog, $log, $stateParams, lanesService, lane, orgId) {
	$scope.lane = lane;
	$scope.saving = false;

	this.cancel = function() {
		$mdDialog.cancel();
	};

	this.submit = function() {
		$scope.saving = true;
		
		lanesService.edit(orgId, $scope.lane.lcname, $scope.lane.lcid).then(function() {
			$scope.saving = false;
			$mdDialog.hide();
		}, function(httpResponse) {
			$scope.saving = false;
			switch(httpResponse.status) {
				case 400:
					httpResponse.data.errors.forEach(function(error) {
						$scope.form[error.field].$error.remote = error.message;
					});
					break;
				default:
					alert('Generic Error during server communication (error: ' + httpResponse.status + ' ' + httpResponse.statusText + ') ');
					$log.warn(httpResponse);
			}
		});
	};
}
