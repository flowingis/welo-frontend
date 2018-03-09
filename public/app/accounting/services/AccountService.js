var AccountService = function($q, $resource, $interval, $http, identity) {
	var resource = $resource('api/:orgId/accounting/:controller/:accountId/:memberId', { controller: 'accounts' }, {
		get: {
			method: 'GET',
			headers: { 'GOOGLE-JWT': identity.getToken() }
		},
		query: {
			method: 'GET',
			isArray: false,
			headers: { 'GOOGLE-JWT': identity.getToken() }
		},
		organizationStatement: {
			method: 'GET',
			headers: { 'GOOGLE-JWT': identity.getToken() },
			params: { controller: 'organization-statement' }
		},
		deposit: {
			method: 'POST',
			headers: { 'GOOGLE-JWT': identity.getToken() },
			params: { controller: 'accounts', memberId: 'deposits' }
		},
		withdraw: {
			method: 'POST',
			headers: { 'GOOGLE-JWT': identity.getToken() },
			params: { controller: 'accounts', memberId: 'withdrawals' }
		},
		transferIn: {
			method: 'POST',
			headers: { 'GOOGLE-JWT': identity.getToken() },
			params: { controller: 'accounts', memberId: 'incoming-transfers' }
		},
		transferOut: {
			method: 'POST',
			headers: { 'GOOGLE-JWT': identity.getToken() },
			params: { controller: 'accounts', memberId: 'outgoing-transfers' }
		}
	});

	this.get = resource.get.bind(resource);
	this.query = resource.query.bind(resource);
	var isPersonalPolling = false;
	personalStatement = function(orgId, filters){
		return $http({
			method: 'GET',
			headers: { 'GOOGLE-JWT': identity.getToken() },
			params: filters,
			url: "api/"+orgId+"/accounting/personal-statement"
		});
	};
	var isOrganizationPolling = false;
	this.organizationStatement = function(organizationId, filters, success, error) {
		isOrganizationPolling = true;
		resource.organizationStatement(
				angular.extend({ orgId: organizationId }, filters),
				function (data) {
					isOrganizationPolling = false;
					success(data);
				},
				function (response) {
					isOrganizationPolling = false;
					error(response);
				});
	};
	var userStats = function(orgId, accountId){
		return $http({
			method: 'GET',
			headers: { 'GOOGLE-JWT': identity.getToken() },
			url: "api/"+orgId+"/accounting/accounts/"+accountId,
			params: { controller: 'members' }
		});
	};

	this.fullPersonalStats = function(orgId, filters){
		var result = {};
		var deferred = $q.defer();

		personalStatement(orgId, filters).then(function(res){
			result.personalStatement = res.data;
			return userStats(orgId, result.personalStatement.id);
		}).then(function(res){
			result.userStats = res.data;
			deferred.resolve(result);
		}).catch(function(error){
			deferred.reject(error);
		});

		return deferred.promise;
	};

	this.deposit = resource.deposit.bind(resource);
	this.withdraw = resource.withdraw.bind(resource);
	this.transferIn = resource.transferIn.bind(resource);
	this.transferOut = function(account, transfer, success, error) {
		return resource.transferOut(
				{
					orgId: account.organization.id,
					accountId: account.id
				},
				transfer,
				success,
				error
		);
	};

	var organizationPolling = null;
	this.startOrganizationPolling = function(organizationId, filters, success, error, millis) {
		this.organizationStatement(organizationId, filters, success, error);
		var that = this;
		organizationPolling = $interval(function() {
			if (isOrganizationPolling) return;
			that.organizationStatement(organizationId, filters, success, error);
		}, millis);
	};
	this.stopOrganizationPolling = function() {
		if(organizationPolling) {
			$interval.cancel(organizationPolling);
			organizationPolling = null;
		}
	};
	this.getIdentity = function() {
		return identity;
	};

	this.getStatementExport = function(orgId){
		return $http({
			method: 'GET',
			headers: { 'GOOGLE-JWT': identity.getToken() },
			url: "api/"+orgId+"/accounting/organization-statement-export"
		});
	};
};
AccountService.prototype = {
	constructor: AccountService,

	getInitialBalance: function(transactions) {
		if(transactions && transactions.length > 0) {
			var last = transactions.slice(-1);
			return parseFloat(last[0].balance) - parseFloat(last[0].amount);
		}
		return 0;
	},

	isOrganizationAccount: function(account) {
		return account && account.type == 'shared';
	},

	isHolder: function(account, userId) {
		return account.holders &&
				account.holders.hasOwnProperty(userId);
	},

	visibilityCriteria: {
		'deposit': function(account) {
			return this.getIdentity().isAuthenticated() &&
				   this.isOrganizationAccount(account) &&
				   account._links['ora:deposit'];
		},
		'withdrawal': function(account) {
			return this.getIdentity().isAuthenticated() &&
				   this.isOrganizationAccount(account) &&
                   account._links['ora:withdrawal'];
		},
		'incomingTransfer': function(account) {
			return this.getIdentity().isAuthenticated() &&
				   this.isOrganizationAccount(account) &&
				   account._links['ora:incoming-transfer'];

        },
		'outgoingTransfer': function(account) {
            return this.getIdentity().isAuthenticated() &&
                   this.isOrganizationAccount(account) &&
                   account._links['ora:outgoing-transfer'];
		}
	},

	isAllowed: function(command, resource) {
		var criteria = this.visibilityCriteria[command];
		if(criteria) {
			criteria = criteria.bind(this);
			return criteria(resource);
		}
		return true;
	}
};
angular.module('app.accounting')
	.service('accountService', ['$q', '$resource', '$interval', '$http', 'identity', AccountService]);