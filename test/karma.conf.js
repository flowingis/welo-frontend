module.exports = function (config) {
	config.set({
		browserConsoleLogOptions: {
            level: 'log',
            format: '%b %T: %m',
            terminal: true
        },

		basePath: '../',

		files: [
			'public/components/angular/angular.js',
			'public/components/jquery/dist/jquery.js',
			'public/components/ngInfiniteScroll/build/ng-infinite-scroll.js',
			'public/components/angular-resource/angular-resource.js',
			'public/components/angular-animate/angular-animate.js',
			'public/components/angular-mocks/angular-mocks.js',
			'public/components/angular-aria/angular-aria.js',
			'public/components/angular-ui-router/release/angular-ui-router.js',
			'public/components/angular-messages/angular-messages.js',
			'public/components/angular-material/angular-material.js',
			'public/components/moment/moment.js',
			'public/components/angular-moment/angular-moment.js',
			'public/app/accounting/module.js',
			'public/app/collaboration/module.js',
			'public/app/flow/module.js',
			'public/app/identity/module.js',
			'public/app/organizations/module.js',
			'public/app/people/module.js',
			'public/app/main/module.js',
			'public/app/**/*.js',
			'test/unit/**/*.js'
		],

		autoWatch: true,

		frameworks: ['jasmine'],

		browsers: ['Chrome'],

		plugins: [
			'karma-chrome-launcher',
			'karma-jasmine'
		],

		junitReporter: {
			outputFile: 'test_out/unit.xml',
			suite: 'unit'
		},

		colors: true

	});
};
