import callIfPresent from '../utils/call-if-present';
import Ember from 'ember';

export default Ember.Service.extend({
	store: Ember.inject.service(),
	notifications: Ember.inject.service(),
	loadingSlider: Ember.inject.service(),
	authManager: Ember.inject.service('auth'),
	routing: Ember.inject.service('-routing'),

	persist: function(data) {
		return new Ember.RSVP.Promise((resolve, reject) => {
			const isArray = Ember.isArray(data),
				models = isArray ? data : [data],
				changedModels = models.filterBy('isDirty');
			if (Ember.isEmpty(changedModels)) {
				return resolve(data);
			}
			// start loading
			this.get('loadingSlider').startLoading();
			Ember.RSVP.all(changedModels.map((model) => model.save()))
				.then((success) => resolve(isArray ? success : success[0]))
				.catch(this.buildErrorHandler(reject))
				.finally(() => this.get('loadingSlider').endLoading());
		});
	},
	markForDelete: function(data) {
		const models = Ember.isArray(data) ? data : [data];
		models.forEach((model) => {
			if (model.get('isNew')) {
				model.rollbackAttributes();
			} else {
				model.deleteRecord();
			}
		});
	},
	buildErrorHandler: function(then = undefined) {
		return function(failure) {
			this.handleError(failure);
			callIfPresent(then, failure);
		}.bind(this);
	},
	handleError: function(failure) {
		// log out if unauthorized
		if (this.checkForStatus(failure, 401)) {
			this.get('authManager').logout();
			this.notifications.info('Please log in first.');
		} else if (this.checkForStatus(failure, 404)) {
			this.get('routing').transitionTo('index');
		} else if (this.checkForStatus(failure, 0)) {
			this.notifications.error(`Sorry, we're having trouble
				connecting to the server. This problem is usually the
				result of a broken Internet connection. You can try
				refreshing this page.`, {
				clearDuration: 10000
			});
		} else if (this.displayErrors(failure) === 0) {
			this.notifications.error(`Could not perform action.
				Please try again later.`);
			Ember.debug('data.handleError: unspecified error: ' + failure);
		}
	},

	// Communications
	// --------------

	sendMessage: function(msg, recipients) {
		const record = this.get('store').createRecord('record', {
			type: 'TEXT',
			contents: msg
		});
		record.get('recipients')
			.pushObjects(Ember.isArray(recipients) ? recipients : [recipients]);
		return this.persist(record)
			.then(() => {
				this.notifications.success('Message successfully sent.');
			}, record.rollbackAttributes.bind(record));
	},
	makeCall: function(recipient) {
		const record = this.get('store').createRecord('record', {
			type: 'CALL'
		});
		record.get('recipients').pushObject(recipient);
		return this.persist(record)
			.then(() => {
				this.notifications.success('Successfully started call.');
			}, record.rollbackAttributes.bind(record));
	},

	// Utility methods
	// ---------------

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
		return failure === status || (failure && failure.errors &&
			failure.errors[0] && failure.errors[0].status === `${status}`);
	},
});
