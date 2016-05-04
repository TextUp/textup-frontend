import DS from 'ember-data';
import Ember from 'ember';

const {
	equal: eq,
	filter
} = Ember.computed;

export default DS.Model.extend({
	username: DS.attr('string'),
	name: DS.attr('string'),
	password: DS.attr('string'), // usually null, for account creation or password change
	email: DS.attr('string'),
	status: DS.attr('string'),
	personalPhoneNumber: DS.attr('string'),
	awayMessage: DS.attr('string', {
		defaultValue: ''
	}),
	numContacts: DS.attr('number'),

	// if has phone, string phone number
	phone: DS.attr('string'),
	// Id of the phone number to provision as the TextUp number
	phoneId: DS.attr('string'),

	org: DS.belongsTo('organization'),
	schedule: DS.belongsTo('schedule'),
	tags: DS.hasMany('tag'),
	teams: DS.hasMany('team'),

	// Computed properties
	// -------------------

	urlIdentifier: Ember.computed('username', function() {
		return Ember.String.dasherize(this.get('username'));
	}),

	isBlocked: eq('status', 'BLOCKED'),
	isPending: eq('status', 'PENDING'),
	isStaff: eq('status', 'STAFF'),
	isAdmin: eq('status', 'ADMIN'),

	teamsWithPhones: Ember.computed('teams.@each', function() {
		return DS.PromiseObject.create({
			promise: new Ember.RSVP.Promise((resolve, reject) => {
				this.get('teams').then((teams) => {
					resolve(teams.filter((team) => Ember.isPresent(team.get('phone'))));
				}, reject);
			})
		});
	}),
	isNone: Ember.computed('isBlocked', 'isPending', 'isAdmin',
		'teamsWithPhones', 'phone',
		function() {
			return new Ember.RSVP.Promise((resolve, reject) => {
				this.get('teamsWithPhones').then((teams) => {
					const isBlocked = this.get('isBlocked'),
						isPending = this.get('isPending'),
						isAdmin = this.get('isAdmin'),
						hasPhone = Ember.isPresent(this.get('phone'));
					// isNone is true when user is blocked OR pending OR
					// if the user is active, but
					// 		(1) does not have phone,
					// 		(2) is not part of team that has a phone,
					// 		(3) is not an admin
					resolve(isBlocked || isPending ||
						(!hasPhone && !teams.length && !isAdmin));
				}, reject);
			});
		}),

	// Not attributes
	// --------------

	newPersonalNumber: null,
});
