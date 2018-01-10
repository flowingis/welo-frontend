function NewItemController(
	$scope,
	$log,
	$mdDialog,
	itemService,
	templateService,
	lanesManaged,
	lanes,
	decisionMode,
	itemType,
	streams,
	orgId) {

	$scope.saving = false;

	$scope.lanes = lanes || [];
	$scope.lanesManaged = lanesManaged;

	$scope.decisionMode = decisionMode;

	$scope.streams = streams;

	$scope.itemType = itemType;

	templateService.list($scope.itemType).then(function(templates){
		$scope.templates = templates;
	});

	$scope.onCloseTemplate = function(){
		if($scope.template){
			$scope.task.description = $scope.templates[$scope.template].value;
		}
	};

	$scope.task = {
		decision:"" + decisionMode
	};

	this.cancel = function() {
		$mdDialog.cancel();
	};
	this.submit = function() {
		$scope.saving = true;
		var onSuccess = function(newItem){
			$mdDialog.hide(newItem);
		};

		if(!$scope.task.streamID){
			//$scope.task.streamID = _.values(streams._embedded['ora:stream'])[0].id;
			$scope.task.streamID = $scope.streams[0].id;
		}

		if(!$scope.task.description){
			$scope.task.description = $scope.task.subject;
		}

		itemService.save(orgId, $scope.task, onSuccess, function(httpResponse) {
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
