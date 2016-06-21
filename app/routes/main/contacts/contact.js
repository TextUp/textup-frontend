import Ember from 'ember';

export default Ember.Route.extend({
	_id: null,

	model: function(params) {
		const id = params.id;
		if (id) {
			this.set('_id', id);
			const found = this.store.peekRecord('contact', id);
			return found ? found : this.store.findRecord('contact', id);
		} else {
			this.transitionTo('main.contacts');
		}
	},
	setupController: function(controller, model) {
		this._super(...arguments);
		this.controller.set('_isReady', false);
		// workaround because ember data invalidates (deletes) the model
		// when it is finalizing the transition when the page is refreshed
		if (model.get('isDeleted')) {
			Ember.run.later(this, this._reloadContact,
				controller, this.get('_id'), 1000);
		} else {
			this._contactIsReady(model);
		}
		this.controller.set('contact', model);
		this.controller.set('tag', null);
		this.controller.set('isMakingCall', false);
	},

	// Actions
	// -------

	actions: {
		didTransition: function() {
			const recordsList = this.controller.get('_recordsList');
			if (recordsList) {
				recordsList.actions.resetPosition();
			}
			return true;
		},
	},

	// Helper methods
	// --------------

	_reloadContact: function(controller, id) {
		const found = this.store.peekRecord('contact', id),
			setContact = function(contact) {
				controller.set('model', contact);
				controller.set('contact', contact);
				this._contactIsReady(contact);
			}.bind(this);
		if (found) {
			setContact(found);
		} else {
			this.store.find('contact', id).then(setContact);
		}
	},
	_contactIsReady: function(contact) {
		this.controller.set('_isReady', true);
		this.set('currentModel', contact);
		if (contact.get('isUnread')) {
			contact.markActive();
			this.get('dataHandler').persist(contact);
		}
	},
});
