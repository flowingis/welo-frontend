angular.module('app', [
	'ui.router',
	'ngMessages',
	'ngMaterial',
	'ngCookies',
	'angularMoment',
	'infinite-scroll',
	'app.identity',
	'app.organizations',
	'app.collaboration',
	'app.people',
	'app.flow',
	'app.accounting',
	'app.kanbanize'
])
	.config(['$stateProvider', '$urlRouterProvider', "$httpProvider",
		function($stateProvider, $urlRouterProvider, $httpProvider) {
			$httpProvider.interceptors.push(function($q) {
				return {
					'responseError': function(rejection) {
						if(rejection.status === 401){
							alert("This page might be private. You could be able to view it after login. press ok to repeat your login");
							var auth2 = gapi.auth2.getAuthInstance();
							auth2.signOut().then(function () {
								window.location.reload();
							});
						}else{
							return $q.reject(rejection);
						}
					}
				};
			});

			$urlRouterProvider.otherwise(function($injector) {
				var $state = $injector.get("$state");

				var SelectedOrganizationId = $injector.get("SelectedOrganizationId");

				if(SelectedOrganizationId.get()){
					$state.go("org.flow", { orgId: SelectedOrganizationId.get() });
				}else{
					$state.go("organizations");
				}
			});
			$stateProvider
				.state('org', {
					abstract: true,
					url: '/:orgId',
					templateUrl: 'app/main/partials/pillars.html',
					resolve: {
						members:['$stateParams','memberService','$q','$state','identity',function($stateParams, memberService,$q,$state,identity) {
							var deferred = $q.defer();
							memberService.query({ orgId: $stateParams.orgId },function(data){
								var getUserMembershipForOrganization = function(orgId, memberships){
									return _.find(memberships, function(membership){
										return membership.organization && (membership.organization.id === orgId);
									});
								};

								var membership = getUserMembershipForOrganization($stateParams.orgId, identity.getMemberships());
								if(!membership || membership.deactivated){
									$state.go("deactivated-user-landing");
								}else{
									deferred.resolve(data);
								}
							});
							return deferred.promise;
						}],
						streams:['streamService','$stateParams','$q',function(streamService,$stateParams,$q){
							var deferred = $q.defer();
							streamService.query($stateParams.orgId,function(data){
								deferred.resolve(_.values(data._embedded['ora:stream']));
							});
							return deferred.promise;
						}]
					},
					controller: 'BaseOrganizationController'
				});
	}])
	.config(['$mdThemingProvider',
		function($mdThemingProvider) {
			$mdThemingProvider.theme('default')
				.primaryPalette('cyan')
				.accentPalette('grey')
				.warnPalette('red', {
      				'hue-1': 'A200'
    			});
			$mdThemingProvider.theme('input', 'default')
				.primaryPalette('grey');
		}])
	.config(['$mdIconProvider',
		function($mdIconProvider) {
			$mdIconProvider.defaultIconSet('icon-set.svg', 24);
		}])
	.run(function(amMoment) {
		amMoment.changeLocale('it');
	});
