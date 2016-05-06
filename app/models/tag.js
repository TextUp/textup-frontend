import DS from 'ember-data';
import Ember from 'ember';

const {
	alias
} = Ember.computed;

export default DS.Model.extend({
	init: function() {
		this._super(...arguments);
		this.set('actions', []);
	},

	name: DS.attr('string'),
	hexColor: DS.attr('string'),
	lastRecordActivity: DS.attr('date'),
	numMembers: DS.attr('number'),

	// Not attributes
	// --------------

	type: 'tag', // for compose menu
	actions: null,

	// Computed properties
	// -------------------

	identifier: alias('name'),
	urlIdentifier: Ember.computed('name', function() {
		return Ember.String.dasherize(this.get('name'));
	}),
});
