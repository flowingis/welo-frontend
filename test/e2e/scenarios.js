describe('Collaboration App', function() {

	describe('Task list view', function() {

		beforeEach(function() {
			browser.get('');
		});

		it('should have a correct title', function () {
	        expect(browser.getTitle()).toEqual('Welo');
	    });

		it('should be redirect to sign-in', function() {
			browser.getCurrentUrl().then(function(actualUrl){
	            expect(actualUrl.endsWith("/#/sign-in")).toBe(true);
	        });
		});

		it('should have log in button', function() {
			expect(element(by.id('googleSignIn')).isPresent()).toBe(true);
		});

	});
});