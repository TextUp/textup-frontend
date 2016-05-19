import Ember from 'ember';
import Public from '../mixins/public-route';

export default Ember.Route.extend(Public, {
	deactivate: function() {
		this._super(...arguments);
		this.controller.setProperties({
			username: null,
			password: null
		});
	},
	actions: {
		login: function(un, pwd, doStore) {
			const auth = this.get('authManager');
			auth.login(un, pwd, doStore).then((data) => {
				this.notifications.success(`Welcome back ${data.staff.name}!`);

				const user = auth.get('authUser');

				console.log('login success!: user: ');
				console.log(user);

				auth.retryAttemptedTransition(() => this.transitionTo('main', user));
			}, () => {
				this.notifications.error('Incorrect or blank username or password');
			});
		},
		resetPassword: function(un) {
			this.get('authManager').resetPassword(un).then(() => {
				this.notifications.success(`All good! The password reset
					should be in your inbox in a few minutes.`);
			}, () => {
				this.notifications.error(`Hmm. We could not find the username
					your provided. Please try again.`);
			});
		}
	}
});
