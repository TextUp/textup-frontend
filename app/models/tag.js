import DS from 'ember-data';
import Ember from 'ember';
import {
	validator,
	buildValidations
} from 'ember-cp-validations';

const {
	alias,
	notEmpty
} = Ember.computed,
	Validations = buildValidations({
		name: {
			description: 'Name',
			validators: [
				validator('presence', true)
			]
		}
	});

export default DS.Model.extend(Validations, {
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

	hasManualChanges: notEmpty('actions'),
	identifier: alias('name'),
	urlIdentifier: Ember.computed('name', function() {
		return Ember.String.dasherize(this.get('name') || '');
	}),
});
