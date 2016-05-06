import DS from 'ember-data';
import Ember from 'ember';

const {
	notEmpty,
	equal: eq,
	alias,
	sort
} = Ember.computed;

export default DS.Model.extend({
	lastRecordActivity: DS.attr('date'),
	name: DS.attr('string'),
	note: DS.attr('string', {
		defaultValue: ''
	}),
	status: DS.attr('string', {
		defaultValue: 'ACTIVE'
	}),
	numbers: DS.attr('collection'),

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

	// Computed properties
	// -------------------

	identifier: Ember.computed('name', 'numbers', function() {
		const name = this.get('name'),
			firstNum = this.get('numbers').objectAt(0);
		return name ? name : (firstNum ? Ember.get(firstNum, 'number') : 'No Name');
	}),
	isShared: notEmpty('sharedBy'),

	isSharedDelegate: eq('permission', 'DELEGATE'),
	isSharedView: eq('permission', 'VIEW'),

	isArchived: eq('status', 'ARCHIVED'),
	isBlocked: eq('status', 'BLOCKED'),
	isActive: eq('status', 'ACTIVE'),
	isUnread: eq('status', 'UNREAD'),
});
