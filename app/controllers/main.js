import Ember from 'ember';
import {
	validate as validateNumber,
	clean as cleanNumber
} from '../utils/phone-number';

export default Ember.Controller.extend({

	shareCandidates: null,
	teamMembers: null,
	contacts: [],

	// Highlight menu items
	// --------------------

	filter: 'all',
	appController: Ember.computed(function() {
		return Ember.getOwner(this).lookup('controller:application');
	}),
	viewingTag: Ember.computed('appController.currentPath', function() {
		return /main.tag/.test(this.get('appController.currentPath'));
	}),

	// New contact
	// -----------

	newContact: null,

	// Compose
	// -------

	selectedRecipients: [],
	composeMessage: '',

	actions: {

		// Update staff
		// ------------

		storeNewPersonalNumber: function(newNum) {
			this.set('newPersonalNumber', newNum);
			return false;
		},
		updatePersonalNumber: function(newNum, isValid) {
			this.set('personalNumber', newNum);
			return false;
		},
		validatePersonalNumber: function(closeAction, validationCode, newNum) {
			console.log('validatePersonalNumber');
			this.set('newPersonalNumber', '');
			return new Ember.RSVP.Promise(function(resolve) {
				closeAction();
				resolve();
			});
		},
		clearNew: function(event) {
			this.set('newPersonalNumber', '');
			return false;
		},

		// Compose
		// -------

		createRecipient: function(val) {
			if (validateNumber(val)) {
				return {
					identifier: cleanNumber(val),
				};
			}
		},
		insertRecipientAt: function(index, recipient, event) {
			return new Ember.RSVP.Promise((resolve, reject) => {
				this.get('selectedRecipients').replace(index, 1, [recipient]);
				resolve();
			});
		},
		deselectRecipient: function(recipient) {
			this.get('selectedRecipients').removeObject(recipient);
		},
		doSearch: function(searchString) {
			return new Ember.RSVP.Promise((resolve, reject) => {
				if (Ember.isBlank(searchString)) {
					return resolve([]);
				}
				this.store.query('contact', {
					search: searchString
				}).then((searchResults) => {
					resolve(searchResults.toArray());
				}, resolve);
			});
		},
	}
});
