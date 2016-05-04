import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
	name: DS.attr('string'),
	hexColor: DS.attr('string'),
	lastRecordActivity: DS.attr('date'),
	numMembers: DS.attr('number'),

	// Not attributes
	// --------------

	actions: [],

	// Computed properties
	// -------------------

	urlIdentifier: Ember.computed('name', function() {
		return Ember.String.dasherize(this.get('name'));
	}),
});
