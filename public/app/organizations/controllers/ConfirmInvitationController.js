angular.module('app')
	.controller('ConfirmInvitationController', [
		'$scope',
		'$stateParams',
		'$state',
		'$mdDialog',
		'SelectedOrganizationId',
		'memberService',
		'InvitationData',
		function (
			$scope,
			$stateParams,
			$state,
			$mdDialog,
			SelectedOrganizationId,
			memberService,
			InvitationData) {

				var onSuccess = function(googleUser) {
					$scope.$apply(function() {
						var profile = googleUser.getBasicProfile();
						var email = profile.getEmail();

						if(email.toLowerCase() === InvitationData.guestEmail.toLowerCase()){
							var confirm = $mdDialog.confirm({
						        title: 'Confirm',
						        textContent: 'Do You want to Join ' + InvitationData.orgName + '?',
						        ok: 'Confirm',
								cancel: 'Cancel'
							});

							$mdDialog.show(confirm).then(function(result){
								if(result){
									$scope.identity.signInFromGoogle(googleUser).then(function(response) {

										SelectedOrganizationId.set(InvitationData.orgId);
										memberService.joinOrganizationAfterInvite({ id: InvitationData.orgId }, function(){
											$scope.identity.updateMemberships().then(function(r){
												$state.go('org.flow',{ orgId: InvitationData.orgId });
											});
										}, function(error) {
											console.log("ERROR!!!!!");
											console.log(JSON.stringify(error));

											
											var message = "Generic Error during server communication. Reload the page and retry";
											var alert = $mdDialog.alert({
												title: 'Error',
												textContent: message,
												ok: 'Close'
											});
											$mdDialog.show(alert);
										});

									}, function(error) {
										console.log("ERROR!!!!!");
										console.log(JSON.stringify(error));

										var message = "Generic Error during server communication. Reload the page and retry";
										var alert = $mdDialog.alert({
											title: 'Error',
											textContent: message,
											ok: 'Close'
										});
										$mdDialog.show(alert);
									});
								}
							});
						}else{
							var message = "Your email (" + email + ") it's not the same used to invite you (" + InvitationData.guestEmail + "). Please login with a different user";
							var alert = $mdDialog.alert({
						        title: 'Error',
						        textContent: message,
						        ok: 'Close'
							});
							$mdDialog.show(alert);
						}
					});
				};

				google.accounts.id.renderButton(
					document.getElementById('googleSignIn'), 
					{
						'width': 230,
						'type': 'standard',
						'theme': 'filled_blue',
						'size': 'large',
						'shape': 'pill'
					}
				);
				google.accounts.id.prompt();
		}]);
