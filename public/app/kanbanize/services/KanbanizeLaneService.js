var Service = function(
	$http,
	$q,
	identity,
	LanesCache) {

	var readBoards = function(projects){

		var boards = _.map(projects,function (p) {
			return p.boards;
		});

		boards = _.flatten(boards,true);

		return boards;
	};

	var findSelectedBoard = function(boards){
		var board = _.find(boards,function(b){
			return !!b.streamId;
		});

		return board;
	};

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

	var updateIfStaleLanes = function(lanes, organizationId) {
		if(moment().diff(moment(lanes.lastUpdate),"days") > 0){
			updateLanes(organizationId);
		}
	};

	return {
		getLanes: function (organizationId) {
            return $http({
                url: "api/organizations/" + organizationId,
                method: 'GET',
                headers: {'GOOGLE-JWT': identity.getToken()}
            }).then(function (response) {
                var data = response.data;


				var lanes = Object
								.keys(data.organization.lanes)
								.map(function(key) {
									var result = [];
									result.lcid = key;
									result.lcname = data.organization.lanes[key];
									return result;
								});

                return lanes || [];
            });
		}
	};
};

angular.module('app.organizations')
	.service('kanbanizeLaneService', [
		"$http",
		'$q',
		'identity',
		'LanesCache',
		Service]);