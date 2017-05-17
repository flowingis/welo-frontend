angular.module('app.collaboration')
    .constant('USER_PHRASE', {
        'TaskCreated':  ' by ',
        'TaskOngoing': ' owned by '
    })
    .filter('logActivityFilter', ['USER_PHRASE', function(USER_PHRASE) {
        return function(historyElement) {
            var date = moment(historyElement.on,"DD/MM/YYYY HH:mm:SS").format('DD/MM/YYYY');
            var name = (historyElement.name) ? historyElement.name.replace(/([A-Z])/g, ' $1').replace(/Task/g, 'Item') : '';
            var historyEvent = date + " - " + name;

            if (USER_PHRASE.hasOwnProperty(historyElement.name) && historyElement.user.name) {
                historyEvent += USER_PHRASE[historyElement.name] + historyElement.user.name;
            }

            return historyEvent;
        };
    }]);
