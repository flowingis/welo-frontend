var UserEmailsService = function($http, $resource, identity) {
	return {
		get: function() {
			return $http({
				method: 'GET',
				url: 'api/users/me/emails',
				headers: {'GOOGLE-JWT': identity.getToken()}
			}).then(function (response) {
				return response.data.settings;
			});
		},

		set: function(emails) {
			return $http({
				method: 'PUT',
				url: 'api/users/me/emails',
				headers: {'GOOGLE-JWT': identity.getToken()},
				data: emails
            }).error(function (err) {
            	console.error(err);
            });
		}
	};
};

angular.module('app.people')
	.service('userEmailsService', ['$http','$resource', 'identity', UserEmailsService]);
