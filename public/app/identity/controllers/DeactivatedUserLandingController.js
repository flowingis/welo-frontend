// DeactivatedUserLandingController.js
angular.module('app')
.controller('DeactivatedUserLandingController', ["$scope", "SelectedOrganizationId", "identity", "streamService", function($scope, SelectedOrganizationId, identity, streamService) {
    $scope.organization = identity.getMembership(SelectedOrganizationId.get());
    $scope.userDesc = identity.getFirstname()+" "+identity.getLastname();
    streamService.query(SelectedOrganizationId.get(),function(data){
        $scope.stream = _.values(data._embedded['ora:stream'])[0];
    });

}]);
