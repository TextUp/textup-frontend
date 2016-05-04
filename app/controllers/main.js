import Ember from 'ember';

export default Ember.Controller.extend({

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

	testNumbers: [],

	// Compose
	// -------

	selectedRecipients: [{
		identifier: '111 222 3333',
		type: 'contact'
	}, {
		identifier: 'Kiki Bai',
		type: 'contact'
	}, {
		identifier: 'Housing First',
		type: 'tag'
	}, {
		identifier: 'Monday Group',
		type: 'tag'
	}, {
		identifier: '555 222 3333',
	}],
	composeMessage: '',

	// Availability
	// ------------

	singleStaffData: {
		monday: [
			['0000', '0300'],
			['0500', '0600']
		],
		tuesday: [
			['0000', '0300'],
			['0500', '0600']
		],
		wednesday: [],
		thursday: [],
		friday: [
			['0000', '0300'],
			['0500', '0600']
		],
		saturday: [],
		sunday: []
	},
	otherStaffData: [{
		name: "Joe Schmo",
		schedule: {
			wednesday: [
				['0000', '0300'],
				['0500', '0600']
			],
			saturday: [
				['0000', '0300'],
				['0500', '0600']
			],
			friday: [
				['0000', '0300'],
				['0500', '0600']
			]
		}
	}, {
		name: "Cindy Ruiz",
		schedule: {
			monday: [
				['0000', '0300'],
				['0500', '0600']
			],
			thursday: [
				['0000', '0300'],
				['0500', '0600']
			],
			friday: [
				['0000', '0300'],
				['0500', '0600']
			]
		}
	}],

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
			console.log("createRecipient for val: " + val);

			return {
				identifier: val,
			};
		},
		insertRecipientAt: function(index, recipient, event) {
			console.log('insertRecipientAt: index: ' + index);
			console.log(recipient);

			return new Ember.RSVP.Promise((resolve, reject) => {
				const recipients = this.get('selectedRecipients');
				recipients.replace(index, 1, [recipient]);
				resolve();
			});
		},
		deselectRecipient: function(recipient) {
			console.log('deselectRecipient');
			console.log(recipient);

			const recipients = this.get('selectedRecipients');
			recipients.removeObject(recipient);
		},
		doSearch: function() {
			return new Ember.RSVP.Promise((resolve, reject) => {
				const recipients = [{
					identifier: '222 888 8888',
					type: 'contact'
				}, {
					identifier: '333 888 8888',
					type: 'contact'
				}, {
					identifier: '555 888 8888',
					type: 'contact'
				}];
				setTimeout(function() {
					resolve(recipients);
				}, 2000);
			});
		},
	}
});
