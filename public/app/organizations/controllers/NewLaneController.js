function NewLaneController(
	$scope,
	$log,
	$mdDialog,
	orgId,
	lanesService) {

	$scope.saving = false;

	this.cancel = function() {
		$mdDialog.cancel();
	};

	this.submit = function() {
		$scope.saving = true;

		lanesService.create(orgId, $scope.laneName).then(function(){
			$scope.saving = false;
			$mdDialog.hide($scope.laneName);
		}, function(httpResponse) {
			
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
