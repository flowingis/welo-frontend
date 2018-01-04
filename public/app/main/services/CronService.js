var Service = function(
	$http,
	$q,
	identity) {

	return {
		force: function (   ) {
            return $http({
                url: "api/kanbanize/sync",
                method: 'GET',
                headers: {'GOOGLE-JWT': identity.getToken()}
            }).then(function (response) {
                console.log(response);
                return response;
            });
		}
	};
};

angular.module('app')
	.service('cronService', [
		"$http",
		'$q',
		'identity',
		Service]);