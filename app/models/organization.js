import Ember from 'ember';
import DS from 'ember-data';

const {
	equal: eq
} = Ember.computed;

export default DS.Model.extend({
	name: DS.attr('string'),
	status: DS.attr('string'),
	numAdmins: DS.attr('number'),

	location: DS.belongsTo('location'),
	teams: DS.hasMany('team'),

	// Computed properties
	// -------------------

	isRejected: eq('status', 'REJECTED'),
	isPending: eq('status', 'PENDING'),
	isApproved: eq('status', 'APPROVED'),
});
