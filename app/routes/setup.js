import Auth from '../mixins/auth-route';
import Ember from 'ember';

export default Ember.Route.extend(Auth, {
	redirect: function() {
		this._super(...arguments);
		const user = this.get('authManager.authUser');
		if (Ember.isPresent(user.get('personalPhoneNumber'))) {
			this.transitionTo('main', user);
		}
	},

	actions: {
		addPersonalPhone: function(staff) {
			this.get('dataHandler')
				.persist(staff)
				.then(() => {
					this.transitionTo('main', staff);
				});
		},
	}
});
