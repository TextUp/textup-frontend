import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
	name: DS.attr('string'),
	hexColor: DS.attr('string'),
	awayMessage: DS.attr('string'),

	org: DS.belongsTo('organization'),
	location: DS.belongsTo('location'),
	tags: DS.hasMany('tag'),

	// if has phone, string phone number
	phone: DS.attr('string'),
	// Id of the phone number to provision as the TextUp number
	newPhoneApiId: DS.attr('string'),

	// Computed properties
	// -------------------

	urlIdentifier: Ember.computed('name', function() {
		return Ember.String.dasherize(this.get('name'));
	}),
});
