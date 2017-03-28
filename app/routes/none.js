import Auth from '../mixins/auth-route';
import Ember from 'ember';
import Setup from '../mixins/setup-route';

export default Ember.Route.extend(Auth, Setup, {
	controllerName: 'main',

	beforeModel: function() {
		this._super(...arguments);
		const user = this.get('authManager.authUser');
		return user.get('isNone').then((isNone) => {
			const orgIsApproved = user.get('org.content.isApproved');
			if (orgIsApproved) {
				if (!isNone) {
					this.transitionTo('main', user);
				} else if (user.get('isAdmin')) {
					this.transitionTo('admin');
				}
			}
		});
	},
	afterModel: function() {
		this.get('stateManager').set('owner', null);
	},
});