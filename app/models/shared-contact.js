import DS from 'ember-data';
import Ember from 'ember';

const {
	equal: eq
} = Ember.computed;

export default DS.Model.extend({
	whenCreated: DS.attr('date'),
	permission: DS.attr('string'),
	sharedWith: DS.attr('string'),

	// Computed properties
	// -------------------

	isDelegate: eq('permission', 'DELEGATE'),
	isView: eq('permission', 'VIEW')
});
