var Service = function(
	$http,
	$q,
	identity) {

	var updateLanes = function(organizationId){
		return $http({
			url: "api/" + organizationId + "/kanbanize/settings",
			method: 'GET',
			headers: {'GOOGLE-JWT': identity.getToken()}
		}).then(function (response) {
			var data = response.data;
			var board = findSelectedBoard(readBoards(data.projects));

			if(board){
				LanesCache.set(organizationId,board.lanes);
			}

			return (board && board.lanes) || [];
		});
    };
    
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