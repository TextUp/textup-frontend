import Ember from 'ember';
import Public from '../mixins/public-route';

export default Ember.Route.extend(Public, {
	deactivate: function() {
		this._super(...arguments);
		this.controller.setProperties({
			username: null,
			password: null,
			resetUsername: null
		});
	},
	actions: {
		login: function(un, pwd, doStore) {
			const auth = this.get('authManager');
			return auth.login(un, pwd, doStore).then((data) => {
				this.notifications.success(`Welcome back ${data.staff.name}!`);
				auth.retryAttemptedTransition(() => {
					this.transitionTo('main', auth.get('authUser'));
				});
			}, () => {
				this.notifications.error('Incorrect or blank username or password');
			});
		},
		resetPassword: function(un) {
			return this.get('authManager').resetPassword(un).then(() => {
				this.notifications.success(`All good! The password reset
					should be in your inbox in a few minutes.`);
			}, () => {
				this.notifications.error(`Hmm. We could not find the username
					your provided. Please try again.`);
			});
		}
	}
});
