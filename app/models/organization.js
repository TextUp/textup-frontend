import Ember from 'ember';
import DS from 'ember-data';
import {
	validator,
	buildValidations
} from 'ember-cp-validations';

const {
	equal: eq
} = Ember.computed,
	Validations = buildValidations({
		name: {
			description: 'Name',
			validators: [
				validator('presence', true)
			]
		},
		location: {
			description: 'Location',
			validators: [
				validator('presence', true),
				validator('belongs-to')
			]
		}
	});

export default DS.Model.extend(Validations, {
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
