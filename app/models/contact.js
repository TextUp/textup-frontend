import DS from 'ember-data';
import Ember from 'ember';
import {
	validator,
	buildValidations
} from 'ember-cp-validations';
import {
	validate as validateNumber
} from '../utils/phone-number';

const {
	notEmpty,
	equal: eq
} = Ember.computed,
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

export default DS.Model.extend(Validations, {
	init: function() {
		this._super(...arguments);
		this.set('actions', []);
	},
	becameInvalid: function() {
		console.log('contact became invalid!');
	},
	becameError: function() {
		console.log('contact became Error!');
	},
	didDelete: function() {
		console.log('contact was deleted!');
	},

	// Attributes
	// ----------

	lastRecordActivity: DS.attr('date'),
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

	records: DS.hasMany('record'),

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
});
