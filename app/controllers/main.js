import Ember from 'ember';

export default Ember.Controller.extend({

	// Account
	// -----

	personalNumber: '213 483 0923',
	newPersonalNumber: '',
	textupNumber: '222 333 2819',
	team: {
		id: 8,
		name: "Housing First",
		phone: '888 999 2019',
		numMembers: 9,
		color: "orange",
		latLng: {
			lat: 34.0522,
			lng: -118.2437
		},
		address: '888 Miracle Mile, Los Angeles, CA 91745'
	},

	// New contact
	// -----------

	testNumbers: [],

	// Compose
	// -------

	tags: [{
		id: 1,
		color: "#493",
		numMembers: 2,
		identifier: "Housing First",
		type: 'tag',
		name: "Housing First",
		actions: []
	}, {
		id: 2,
		color: "#1BA5E0",
		numMembers: 0,
		identifier: "Rapid Rehousing",
		type: 'tag',
		name: "Rapid Rehousing",
		actions: []
	}, {
		id: 3,
		color: "#d3d3d3",
		numMembers: 2,
		identifier: "WO",
		type: 'tag',
		name: "WO",
		actions: []
	}, {
		id: 4,
		color: "#dd3",
		numMembers: 4,
		identifier: "Woman's Collective Interest Group",
		type: 'tag',
		name: "Woman's Collective Interest Group",
		actions: []
	}, {
		id: 5,
		color: "#f8f",
		numMembers: 1,
		identifier: "Monday Group",
		type: 'tag',
		name: "Monday Group",
		actions: []
	}],
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
