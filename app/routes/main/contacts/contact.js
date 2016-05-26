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
		// workaround because ember data invalidates (deletes) the model
		// when it is finalizing the transition when the page is refreshed
		if (model.get('isDeleted')) {
			Ember.run.later(this, this._reloadContact,
				controller, this.get('_id'), 1000);
		}
		this.controller.set('contact', model);
		this.controller.set('tag', null);
		this.controller.set('records', []);
		this.controller.set('isMakingCall', false);
		// don't know until loaded
		this.controller.set('totalNumRecords', '--');
	},

	_reloadContact: function(controller, id) {
		const found = this.store.peekRecord('contact', id),
			setContact = function(contact) {
				controller.set('model', contact);
				controller.set('contact', contact);
			};
		if (found) {
			setContact(found);
		} else {
			this.store.find('contact', id).then(setContact);
		}
	},
});
