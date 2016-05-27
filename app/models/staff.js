import DS from 'ember-data';
import Ember from 'ember';
import HasPhone from '../mixins/phone-model';
import {
	validator,
	buildValidations
} from 'ember-cp-validations';

const {
	equal: eq,
	alias
} = Ember.computed,
	Validations = buildValidations({
		name: {
			description: 'Name',
			validators: [
				validator('presence', true)
			]
		},
		username: {
			description: 'Username',
			validators: [
				validator('presence', true)
			]
		},
		email: {
			description: 'Email',
			validators: [
				validator('format', {
					type: 'email'
				})
			]
		}
	});

export default DS.Model.extend(Validations, HasPhone, {

	rollbackAttributes: function() {
		this._super(...arguments);
		this.set('isSelected', false);
	},

	// Attributes
	// ----------

	username: DS.attr('string'),
	name: DS.attr('string'),
	// usually blank, for account creation or password change
	password: DS.attr('string', {
		defaultValue: ''
	}),
	email: DS.attr('string'),
	status: DS.attr('string'),
	personalPhoneNumber: DS.attr('string'),

	org: DS.belongsTo('organization'),
	tags: DS.hasMany('tag'),
	teams: DS.hasMany('team'),

	// Schedule
	// --------

	isAvailableNow: DS.attr('boolean'),
	nextAvailable: DS.attr('date'),
	nextUnavailable: DS.attr('date'),

	sunday: DS.attr('collection'),
	monday: DS.attr('collection'),
	tuesday: DS.attr('collection'),
	wednesday: DS.attr('collection'),
	thursday: DS.attr('collection'),
	friday: DS.attr('collection'),
	saturday: DS.attr('collection'),

	// Not attributes
	// --------------

	isSelected: false,

	// Computed properties
	// -------------------

	urlIdentifier: Ember.computed('username', function() {
		return Ember.String.dasherize(this.get('username') || '');
	}),
	sharingId: alias('phoneId'), // for building share actions

	isBlocked: eq('status', 'BLOCKED'),
	isPending: eq('status', 'PENDING'),
	isStaff: eq('status', 'STAFF'),
	isAdmin: eq('status', 'ADMIN'),

	teamsWithPhones: Ember.computed('teams.@each', function() {
		return DS.PromiseArray.create({
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
});
