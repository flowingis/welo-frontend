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

		var initMembers = function(){
			memberService.query({ orgId: $stateParams.orgId },function(data){
				//$scope.membersArray = getSortedMembersArray(data);
				$scope.membersArray = _.values(data._embedded['ora:member']);
				$scope.totalPeople = data.total;
				$scope.loading = false;
			},function(){
				$scope.loading = false;
			});
		};
		initMembers();
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
			console.log(member.involvement);

			var strWarningMsg = "";

			var item_label = member.involvement.membershipsCount > 1 ? "items" : "item";
			switch (true) {
				case ((member.involvement.ownershipsCount>0) && (member.involvement.membershipsCount>0)): 
					strWarningMsg = "<p><strong>" + member.firstname + " " + member.lastname + "</strong>  is the owner of <strong class=\"warn\">" + member.involvement.ownershipsCount + "</strong> open "+item_label+" and involved in <strong>" + member.involvement.membershipsCount + "</strong> open items.</p>";
				break;
				case ((member.involvement.ownershipsCount==0) && (member.involvement.membershipsCount>0)): 
					strWarningMsg = "<p><strong>" + member.firstname + " " + member.lastname + "</strong>  is involved in <strong>" + member.involvement.membershipsCount + "</strong> open "+item_label+".</p>";
				break;
				default:
					break;
			}

			var strWARNING = "";
			if(member.involvement.membershipsCount>0){
				strWARNING = "<p>WARNING: </p>" + strWarningMsg + "<p>";
			}


			var confirm = $mdDialog.confirm()
					.title("Would you remove this user from the organization?")
					.htmlContent(strWARNING + member.firstname + " " + member.lastname + " will be removed from the open cards in which he is involved and the removal operation can not be canceled.<br />Are you sure you want to proceed?</p>")
					.targetEvent(ev)
					.ok("Yes")
					.cancel("No");

			$mdDialog.show(confirm).then(function() {
				$scope.loading = true;
				memberService.removeUserFromOrganization($stateParams.orgId,member.id).then(function(){
					memberService.query({ orgId: $stateParams.orgId },function(data){
						initMembers();
					});
				});
			});

		};
	}
]);
