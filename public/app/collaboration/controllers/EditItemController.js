function EditItemController($scope, $mdDialog, $log, itemService, lanesService, $stateParams, task, lanesManaged) {
	$scope.item = task;
	$scope.lanesManaged = lanesManaged;

	this.cancel = function() {
		$mdDialog.cancel();
	};

	$scope.lanes = [];
	if ($scope.lanesManaged) {
		lanesService.get($stateParams.orgId).then(function(lanes){
			$scope.lanes = lanes;
		});
	}
	

	this.submit = function() {
		itemService.edit($scope.item, $mdDialog.hide, function(httpResponse) {
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
