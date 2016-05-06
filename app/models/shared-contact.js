import DS from 'ember-data';
import Ember from 'ember';

const {
	equal: eq,
	alias
} = Ember.computed;

export default DS.Model.extend({
	whenCreated: DS.attr('date'),
	permission: DS.attr('string'),
	sharedWith: DS.attr('number'),

	// Computed properties
	// -------------------

	sharingId: alias('sharedWith'),
	isDelegate: eq('permission', 'DELEGATE'),
	isView: eq('permission', 'VIEW')
});
