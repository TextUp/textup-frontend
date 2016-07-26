import DS from 'ember-data';
import Ember from 'ember';
import {
	validator,
	buildValidations
} from 'ember-cp-validations';
import {
	validate as validateNumber
} from '../utils/phone-number';
import RecordModel from '../mixins/record-model';
import FutureMessageModel from '../mixins/future-message-model';

const {
	computed: {
		notEmpty,
		equal: eq
	}
} = Ember,
Validations = buildValidations({
	name: {
		description: 'Name',
		validators: [
			validator('presence', true)
		]
	},
	note: {
		description: 'Note',
		validators: [
			validator('length', {
				max: 1000
			}),
		]
	},
	status: validator('inclusion', { in : [
			'UNREAD', 'ACTIVE', 'ARCHIVED', 'BLOCKED'
		]
	}),
	numbers: {
		description: 'Numbers',
		validators: [
			validator('collection', {
				collection: true,
				dependentKeys: ['numbers.@each.number'],
				message: 'All phone numbers must be valid, with area code',
				for: 'every',
				test: function(numObj) {
					return validateNumber(Ember.get(numObj, 'number'));
				}
			}),
			validator('length', {
				min: 1,
				message: 'Contact must have at least {min} phone number.'
			}),
		]
	}
});

export default DS.Model.extend(Validations, RecordModel, FutureMessageModel, {
	init: function() {
		this._super(...arguments);
		this.set('actions', []);
	},
	rollbackAttributes: function() {
		this._super(...arguments);
		this.get('actions').clear();
		this.set('isSelected', false);
	},

	// Attributes
	// ----------

	name: DS.attr('string', {
		defaultValue: ''
	}),
	note: DS.attr('string', {
		defaultValue: ''
	}),
	status: DS.attr('string', {
		defaultValue: 'ACTIVE'
	}),
	numbers: DS.attr('collection', {
		defaultValue: () => []
	}),
	phone: DS.belongsTo('phone'),

	// Contact
	// -------

	tags: DS.hasMany('tag'),
	sharedWith: DS.hasMany('sharedContact'),

	// Shared contact
	// --------------

	permission: DS.attr('string'),
	startedSharing: DS.attr('date'),
	sharedBy: DS.attr('string'),
	sharedById: DS.attr('number'),

	// Not attributes
	// --------------

	type: 'contact', // for compose menu
	isSelected: false,
	actions: null,

	// Computed properties
	// -------------------

	hasManualChanges: notEmpty('actions'),
	identifier: Ember.computed('name', 'numbers', function() {
		const name = this.get('name'),
			firstNum = this.get('numbers').objectAt(0);
		return name ? name : (firstNum ? Ember.get(firstNum, 'number') : 'No Name');
	}),

	isShared: notEmpty('sharedBy'),
	isSharedDelegate: eq('permission', 'DELEGATE'),
	isSharedView: eq('permission', 'VIEW'),
	allowEdits: Ember.computed('isShared', 'isSharedDelegate', function() {
		const shared = this.get('isShared'),
			delegate = this.get('isSharedDelegate');
		return !shared || (shared && delegate);
	}),

	isArchived: eq('status', 'ARCHIVED'),
	isBlocked: eq('status', 'BLOCKED'),
	isActive: eq('status', 'ACTIVE'),
	isUnread: eq('status', 'UNREAD'),

	// Helper methods
	// --------------

	isAnyStatus: function(raw) {
		return (Ember.isArray(raw) ? raw : [raw])
			.map((stat) => String(stat).toLowerCase())
			.contains(String(this.get('status')).toLowerCase());
	},
	markUnread: function() {
		this.set('status', 'UNREAD');
	},
	markActive: function() {
		this.set('status', 'ACTIVE');
	},
	markArchived: function() {
		this.set('status', 'ARCHIVED');
	},
	markBlocked: function() {
		this.set('status', 'BLOCKED');
	}
});
