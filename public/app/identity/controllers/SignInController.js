angular.module('app.identity')
	.controller('SignInController', [
		'$scope',
		'$log',
		'$state',
		'SelectedOrganizationId',
		function(
			$scope,
			$log,
			$state,
			SelectedOrganizationId) {

			$scope.onSuccess = function(accessToken) {
				$scope.$apply(function() {
					$scope.identity.signInFromGoogle(accessToken);
					$scope.identity.loadMemberships().then(function(memberships) {

						if (memberships && memberships.length) {
							SelectedOrganizationId.set(memberships[0].organization.id);

                                if ($state.previous) {
                                    $log.debug('Redirecting to ' + $state.previous.name);

                                    $state.go($state.previous.name, $state.previousParams);
                                    $state.previous = null;
                                    $state.previousParams = null;

                                    return;
                                }

								$state.go('org.flow',{ orgId: memberships[0].organization.id });
							return;
						}

                        if ($state.previous) {
                            $log.debug('Redirecting to ' + $state.previous.name);

                            $state.go($state.previous.name, $state.previousParams);
                            $state.previous = null;
                            $state.previousParams = null;

                            return;
                        }

						$state.go('organizations');
					});
				});
			};

			$scope.renderSignInButton = function() {
				window.googleApi.initJWT(function () {
					console.log('requested token ' + window.googleApi.accessToken);
					$scope.onSuccess(window.googleApi.accessToken);
				});

				google.accounts.id.initialize({
					client_id: window.googleApi.CLIENT_ID,
					callback: function(response) {
						console.log('initialized token: ' + response.credential);
						// window.googleApi.getJWTToken();
						$scope.onSuccess(response.credential);
					}
				});

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
			};

			$scope.start = function() {
				$scope.renderSignInButton();
			};

			$scope.start();
		}]);
