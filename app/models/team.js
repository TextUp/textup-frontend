import DS from 'ember-data';
import Ember from 'ember';
import {
	validator,
	buildValidations
} from 'ember-cp-validations';

const {
	notEmpty,
	or,
	alias
} = Ember.computed,
	Validations = buildValidations({
		name: {
			description: 'Name',
			validators: [
				validator('presence', true)
			]
		},
		hexColor: {
			description: 'Color',
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
	init: function() {
		this._super(...arguments);
		this.set('actions', []);
	},
	rollbackAttributes: function() {
		this._super(...arguments);
		this.set('newPhone', null);
		this.get('actions').clear();
	},

	// Attributes
	// ----------

	name: DS.attr('string'),
	hexColor: DS.attr('string', {
		defaultValue: '#3399cc'
	}),
	awayMessage: DS.attr('string', {
		defaultValue: ''
	}),
	numMembers: DS.attr('number'),

	org: DS.belongsTo('organization'),
	location: DS.belongsTo('location'),
	tags: DS.hasMany('tag'),

	// if has phone, string phone number
	phone: DS.attr('phone-number'),

	// Not attributes
	// --------------

	newPhone: null,
	actions: null,

	// Computed properties
	// -------------------

	locationIsDirty: alias('location.hasDirtyAttributes'),
	hasActions: notEmpty('actions'),
	hasNewPhone: notEmpty('newPhone'),
	hasManualChanges: or('hasActions', 'hasNewPhone', 'locationIsDirty'),
	urlIdentifier: Ember.computed('name', function() {
		return Ember.String.dasherize(this.get('name') || '');
	}),
});
