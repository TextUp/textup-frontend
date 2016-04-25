import Ember from 'ember';

export default Ember.Controller.extend({
	numbers: [{
		number: '111 222 3333',
		region: 'RI, US'
	}, {
		number: '222 222 3333',
	}, {
		number: '333 222 3333',
		region: 'RI, US'
	}, {
		number: '444 222 3333',
		region: 'RI, US'
	}, {
		number: '555 222 3333',
		region: 'RI, US'
	}, {
		number: '777 222 3333',
	}],
	teams: [{
		name: "Rapid Rehousing",
		numMembers: 23,
		color: "purple"
	}, {
		name: "Housing First",
		numMembers: 9,
		color: "orange"
	}, {
		name: "Outreach",
		numMembers: 2,
		color: "yellow"
	}],
	org: {
		name: "Rhode Island House",
		latLng: {
			lat: 34.0522,
			lng: -118.2437
		},
		address: '888 Miracle Mile, Los Angeles, CA 91745'
	},

	actions: {
		updateStaff: function() {
			console.log('updateStaff');
			return false;
		},
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
	}
});
