angular.module('app.collaboration')
.filter('logActivityFilter', [function() {
	return function(historyElement) {
        var date = moment(historyElement.on,"DD/MM/YYYY HH:mm:SS").format('DD/MM/YYYY');
        var name = historyElement.name.replace(/([A-Z])/g, ' $1');
        var historyEvent = date + " - " + name;

        if (historyElement.user.name != '') {
            historyEvent += " by " + historyElement.user.name;
        }

        return historyEvent;
    };
}]);
