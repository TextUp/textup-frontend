import Auth from '../mixins/auth-route';
import Ember from 'ember';

export default Ember.Route.extend(Auth, {
	controllerName: 'main',

	afterModel: function() {
		this.get('stateManager').set('owner', null);
	},

	actions: {
		logout: function() {
			this.get('authManager').logout();
		},
	}
});
