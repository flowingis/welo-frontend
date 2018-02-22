angular.module('app.collaboration')
	.constant('TASK_STATUS_CLASS', {
		0:  'Idea',
		10: 'Open',
		20: 'Ongoing',
		30: 'Completed',
		40: 'Accepted',
		50: 'Closed',
		'-20': 'Rejected'
	})
	.filter('ItemStatusClass', ['TASK_STATUS_CLASS', function(TASK_STATUS_CLASS) {
		return function(status) {
			return TASK_STATUS_CLASS.hasOwnProperty(status) ? TASK_STATUS_CLASS[status] : status;
		};
	}]);
