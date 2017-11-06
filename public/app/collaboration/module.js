angular.module('app.collaboration', ['ui.router', 'ngSanitize'])
	.config(['$stateProvider', '$urlRouterProvider',
		function($stateProvider) {
			$stateProvider
				.state('org.collaboration', {
					url: '/items',
					templateUrl: 'app/collaboration/partials/item-list.html',
					data: {
						pillarName: 'Items',
						decisions: false
					},
					controller: 'ItemListController as ctrl'
				})
				.state('org.kanban', {
					url: '/kanban',
					templateUrl: 'app/collaboration/partials/kanban.html',
					data: {
						pillarName: 'Kanban',
						decisions: false
					},
					controller: 'KanbanController as ctrl'
				})
				.state('org.decisions', {
					url: '/decisions',
					templateUrl: 'app/collaboration/partials/item-list.html',
					data: {
						pillarName: 'Decisions',
						decisions: true
					},
					controller: 'ItemListController as ctrl'
				})
				.state('org.item', {
					url: '/items/:itemId',
					templateUrl: 'app/collaboration/partials/item-detail.html',
					data: {
						showBack: true,
						backTo: '',
						backLabel: ''
					},
					controller: 'ItemDetailController as ctrl'
				});
		}
	]);
