import DS from 'ember-data';
import Ember from 'ember';
import {
	validator,
	buildValidations
} from 'ember-cp-validations';

const {
	isPresent,
	isArray,
	computed: {
		equal: eq,
		alias,
		or,
		notEmpty
	}
} = Ember,
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
			validator('presence', true),
			validator('format', {
				regex: /^[-_=@.,;A-Za-z0-9]+$/,
				message: 'Usernames may not have spaces and can only include letters, numbers and the following symbols - _ = @ . , ;'
			})
		]
	},
	lockCode: {
		description: 'Lock Code',
		validators: [
			validator('length', {
				is: 4,
				allowNone: true,
				allowBlank: true
			})
		]
	},
	email: {
		description: 'Email',
		validators: [
			validator('format', {
				type: 'email'
			})
		]
	},
	phone: {
		description: 'Phone',
		validators: [
			validator('belongs-to')
		]
	}
});

export default DS.Model.extend(Validations, {

	authManager: Ember.inject.service('auth'),

	rollbackAttributes: function() {
		this._super(...arguments);
		this.set('isSelected', false);
		this.set('phoneAction', null);
		this.set('phoneActionData', null);
		this.set('enableNotifications',
			isPresent(this.get('personalPhoneNumber')));
		this.get('phone').then((phone) => phone && phone.rollbackAttributes());
		this.get('schedule').then((sched) => sched && sched.rollbackAttributes());
	},

	// Events
	// ------

	didUpdate: function() {
		this.get('schedule').then((sched) => sched && sched.rollbackAttributes());
	},

	// Attributes
	// ----------

	username: DS.attr('string'),
	name: DS.attr('string'),
	// usually blank, for account creation or password change
	password: DS.attr('string', {
		defaultValue: ''
	}),
	// usually blank, for account creation or lockCode change
	lockCode: DS.attr('string', {
		defaultValue: ''
	}),
	// usually blank, for account creation
	captcha: DS.attr('string', {
		defaultValue: ''
	}),

	email: DS.attr('string'),
	status: DS.attr('string'),
	personalPhoneNumber: DS.attr('phone-number'),

	org: DS.belongsTo('organization'),
	phone: DS.belongsTo('phone'),
	hasInactivePhone: DS.attr('boolean'),
	schedule: DS.belongsTo('schedule'),

	manualSchedule: DS.attr('boolean'),
	isAvailable: DS.attr('boolean'),

	teams: DS.hasMany('team'),

	// Not attributes
	// --------------

	type: 'staff',
	isSelected: false,
	phoneAction: null, // one of number, transfer, deactivate
	phoneActionData: null,

	// Computed properties
	// -------------------

	phoneIsDirty: alias('phone.isDirty'),
	scheduleIsDirty: alias('schedule.isDirty'),
	hasPhoneAction: notEmpty('phoneAction'),
	hasPhoneActionData: notEmpty('phoneActionData'), // not all actions have data!
	hasManualChanges: or('phoneIsDirty', 'scheduleIsDirty', 'hasPhoneAction'),
	enableNotifications: Ember.computed('personalPhoneNumber', {
		get: function() {
			return isPresent(this.get('personalPhoneNumber'));
		},
		set: function(key, value) {
			if (value === false) {
				this.set('personalPhoneNumber', '');
			} else if (value === true) {
				const changes = this.changedAttributes()['personalPhoneNumber'];
				if (isArray(changes)) {
					this.set('personalPhoneNumber', changes[0]);
				}
			}
			return value;
		}
	}),

	isAvailableNow: Ember.computed('manualSchedule', 'isAvailable',
		'schedule.content.isAvailableNow',
		function() {
			return this.get('manualSchedule') ?
				this.get('isAvailable') :
				this.get('schedule.content.isAvailableNow');
		}),

	urlIdentifier: Ember.computed('username', function() {
		return Ember.String.dasherize(this.get('username') || '');
	}),
	sharingId: alias('phone.content.id'), // for building share actions
	transferId: Ember.computed('id', function() {
		return `staff-${this.get('id')}`;
	}),
	transferFilter: Ember.computed('name', 'username', 'email', function() {
		const name = this.get('name'),
			username = this.get('username'),
			email = this.get('email');
		return `${name},${username},${email}`;
	}),

	isBlocked: eq('status', 'BLOCKED'),
	isPending: eq('status', 'PENDING'),
	isStaff: eq('status', 'STAFF'),
	isAdmin: eq('status', 'ADMIN'),

	teamsWithPhones: Ember.computed('teams.[]', function() {
		return DS.PromiseArray.create({
			promise: new Ember.RSVP.Promise((resolve, reject) => {
				this.get('teams').then((teams) => {
					Ember.RSVP.all(teams.mapBy('phone.content')).then((phones) => {
						const teamsWithPhones = [];
						phones.forEach((phone, index) => {
							if (Ember.isPresent(phone)) {
								teamsWithPhones.pushObject(teams.objectAt(index));
							}
						});
						resolve(teamsWithPhones);
					});
				}, reject);
			})
		});
	}),
	isNone: Ember.computed('isBlocked', 'isPending', 'teamsWithPhones', 'phone',
		function() {
			return new Ember.RSVP.Promise((resolve, reject) => {
				this.get('teamsWithPhones').then((teams) => {
					this.get('phone').then((phone) => {
						const isBlocked = this.get('isBlocked'),
							isPending = this.get('isPending'),
							hasPhone = Ember.isPresent(phone);
						// isNone is true when user is blocked OR pending OR
						// if the user is active, but
						// 		(1) does not have phone,
						// 		(2) is not part of team that has a phone,
						resolve(isBlocked || isPending ||
							(!hasPhone && !teams.length));
					});
				}, reject);
			});
		}),
	isAuthUser: Ember.computed('authManager.authUser', function() {
		return this.get('authManager.authUser.id') === this.get('id');
	}),

	// Helper methods
	// --------------

	isAnyStatus: function(raw) {
		return (Ember.isArray(raw) ? raw : [raw])
			.map((stat) => String(stat).toLowerCase())
			.contains(String(this.get('status')).toLowerCase());
	},
	makeStaff: function() {
		if (!this.get('isAuthUser')) {
			this.set('status', 'STAFF');
		}
	},
	makeAdmin: function() {
		if (!this.get('isAuthUser')) {
			this.set('status', 'ADMIN');
		}
	},
	block: function() {
		if (!this.get('isAuthUser')) {
			this.set('status', 'BLOCKED');
		}
	}
});
