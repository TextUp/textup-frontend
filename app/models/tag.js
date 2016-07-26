import DS from 'ember-data';
import Ember from 'ember';
import {
	validator,
	buildValidations
} from 'ember-cp-validations';
import RecordModel from '../mixins/record-model';
import FutureMessageModel from '../mixins/future-message-model';

const {
	alias,
	notEmpty,
	equal: eq
} = Ember.computed,
	Validations = buildValidations({
		name: {
			description: 'Name',
			validators: [
				validator('presence', true)
			]
		}
	});

export default DS.Model.extend(Validations, RecordModel, FutureMessageModel, {

	init: function() {
		this._super(...arguments);
		this.set('actions', []);
	},
	rollbackAttributes: function() {
		this._super(...arguments);
		this.get('actions').clear();
	},

	// Attributes
	// ----------

	name: DS.attr('string'),
	hexColor: DS.attr('string'),
	phone: DS.belongsTo('phone'),
	numMembers: DS.attr('number'),

	// Not attributes
	// --------------

	type: 'tag', // for compose menu
	actions: null,

	// Computed properties
	// -------------------

	isEmpty: eq('numMembers', 0),
	hasManualChanges: notEmpty('actions'),
	identifier: alias('name'),
	urlIdentifier: Ember.computed('name', function() {
		return Ember.String.dasherize(this.get('name') || '');
	}),
});
