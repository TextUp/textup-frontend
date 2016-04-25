import Ember from 'ember';

export default Ember.Controller.extend({
	person: {
		name: 'Kiki Bai',
		username: 'kbai888',
		status: 'STAFF',
		phone: '291 932 9302',
		email: "kbai888@textup.org",
		teams: [{
			name: "Rapid Rehousing",
			color: "purple"
		}, {
			name: "Housing First",
			color: "orange"
		}],
		schedule: {
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
		}
	},
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
	}, {
		name: "Cleanup Crew",
		numMembers: 5,
		color: "pink"
	}],

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
