angular.module('app.people')
.controller('MemberListController', [
	'$scope',
	'$log',
	'memberService',
	'$stateParams',
	'$mdDialog',
	function (
		$scope,
		$log,
		memberService,
		$stateParams,
		$mdDialog) {

		$scope.isMe = function(person){
			//console.log("EEEE");
			//console.log(person);
			return person.id === $scope.identity.getId();
		};

		$scope.totalPeople = 0;
		$scope.loading = true;

		var getSortedMembersArray = function(data){
			var membersArray = _.orderBy(_.values(data._embedded['ora:member']), function(p) {
				return p.firstname + p.lastname;
			}, "asc");
			return _.orderBy(membersArray, function(p) {
				if (p.role==="admin") {
					p.role = "member";
				}

				return p.role;
			}, "desc");
		};

		memberService.query({ orgId: $stateParams.orgId },function(data){
			$scope.membersArray = getSortedMembersArray(data);
			$scope.totalPeople = data.total;
			$scope.loading = false;
		},function(){
			$scope.loading = false;
		});

		$scope.loadMore = function() {
			$scope.loading = true;
			memberService.getPeople($stateParams.orgId, $scope.membersArray.length).then(function(response){
				$scope.membersArray = $scope.membersArray.concat(getSortedMembersArray(response.data));
			})["finally"](function(){
				$scope.loading = false;
			});
		};

		$scope.orgId = $stateParams.orgId;

		var sendInvitation = function(data){
			var name = data.name;
			if(data.surname){
				name += " " + data.surname;
			}else{
				data.surname = "";
			}

			memberService.inviteNewUser($stateParams.orgId,data).then(function(){
				return $mdDialog.alert({
			        title: 'Invite sent',
			        textContent: name + ' invited to your organization',
			        ok: 'Close'
				});
			},function(){
				return $mdDialog.alert({
			        title: 'Error',
			        textContent: 'Error during invitation. Please retry',
			        ok: 'Close'
				});
			}).then(function(dialog){
				$mdDialog.show(dialog);
			});
		};

		$scope.canInviteNewUser = memberService.canInviteNewUser($stateParams.orgId);
		$scope.isAllowed = memberService.isAllowed.bind(memberService);

		$scope.openInvitationDialog = function(ev){
			$mdDialog.show({
				controller: 'InvitationController',
				templateUrl: "app/people/partials/invitation.html",
				targetEvent: ev,
				clickOutsideToClose: true
			}).then(sendInvitation);
		};

		$scope.removeUser = function(ev,member){
			var confirm = $mdDialog.confirm()
					.title("Would you remove this user from the organization?")
					.textContent("This operation cannot be undone.")
					.targetEvent(ev)
					.ok("Yes")
					.cancel("No");

			$mdDialog.show(confirm).then(function() {
				memberService.removeUserFromOrganization($stateParams.orgId,member.id).then(function(){
					memberService.query({ orgId: $stateParams.orgId },function(data){
						//$scope.members = data;
					});
				});
			});

		};
	}
]);
