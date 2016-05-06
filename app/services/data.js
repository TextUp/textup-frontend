import Ember from 'ember';

export default Ember.Service.extend({
	store: Ember.inject.service(),
	notifications: Ember.inject.service(),

	persist: function(model, errorMsg = undefined) {
		return new Ember.RSVP.Promise((resolve, reject) => {
			model.save().then(resolve, (failure) => {
				if (this.displayErrors(failure) === 0) {
					const action = model.get('isNew') ? 'save' : 'update',
						msg = errorMsg ? errorMsg : `Could not ${action}. Please try again later.`;
					this.notifications.error(msg);
				}
				reject(failure);
			});
		});
	},
	displayErrors: function(failure) {
		let numMessages = 0;
		if (failure && failure.errors) {
			failure.errors.forEach((error) => {
				const msg = error.title || error.message;
				if (msg) {
					this.notifications.error(msg);
					numMessages++;
				}
			});
		}
		return numMessages;
	},
	checkForStatus: function(failure, status) {
		return failure && failure.errors &&
			failure.errors[0] && failure.errors[0].status === `${status}`;
	},
});
