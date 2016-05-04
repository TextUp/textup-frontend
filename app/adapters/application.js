import DS from 'ember-data';
import Ember from "ember";
import config from '../config/environment';

export default DS.RESTAdapter.extend({
	authManager: Ember.inject.service('auth'),

	host: config.host,
	namespace: 'v1',
	headers: Ember.computed('authManager.token', function() {
		const token = this.get('authManager.token');
		return token ? {
			Authorization: `Bearer ${token}`
		} : {};
	})
});
