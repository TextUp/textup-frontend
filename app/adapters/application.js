import DS from 'ember-data';
import Ember from "ember";
import config from '../config/environment';

export default DS.RESTAdapter.extend({
	authManager: Ember.inject.service('auth'),
	stateManager: Ember.inject.service('state'),

	host: config.host,
	namespace: 'v1',
	coalesceFindRequests: true,
	headers: Ember.computed('authManager.token', function() {
		const token = this.get('authManager.token');
		return token ? {
			Authorization: `Bearer ${token}`
		} : {};
	}),

	// Helper methods
	// --------------

	_addTeamIdIfCreate: function(url, requestType) {
		if (requestType === 'createRecord') {
			const team = this.get('stateManager.ownerAsTeam');
			return this._addQueryParam(url, 'teamId', team && team.get('id'));
		} else {
			return url;
		}
	},
	_addQueryParam: function(url, queryKey, queryVal) {
		if (url && queryKey && queryVal) {
			const hasQuery = (url.indexOf('?') !== -1);
			return hasQuery ? `${url}&${queryKey}=${queryVal}` :
				`${url}?${queryKey}=${queryVal}`;
		} else {
			return url;
		}
	},
});
