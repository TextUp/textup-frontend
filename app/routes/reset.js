import Ember from 'ember';

export default Ember.Route.extend({

	// Events
	// ------

	redirect: function(model, transition) {
		const token = Ember.get(transition, 'queryParams.token');
		if (!token) {
			this.transitionTo('login');
		}
	},
	deactivate: function() {
		this.controller.set('newPassword', '');
		this.controller.set('confirmNewPassword', '');
	},

	// Actions
	// -------

	actions: {
		completeReset: function(newPassword) {
			const token = this.controller.get('token');
			return this.get('authManager').completeResetPassword(token, newPassword)
				.then(() => {
					this.notifications.success('Successfully reset your password!');
					this.transitionTo('login');
				}, this.get('dataHandler').buildErrorHandler());
		}
	}
});
