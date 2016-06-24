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
		phone: {
			description: 'Phone',
			validators: [
				validator('belongs-to')
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
		this.get('actions').clear();
		this.set('phoneAction', null);
		this.set('phoneActionData', null);
		this.get('phone').then((phone) => phone && phone.rollbackAttributes());
		this.get('location').then((loc) => loc && loc.rollbackAttributes());
	},

	// Attributes
	// ----------

	name: DS.attr('string'),
	hexColor: DS.attr('string', {
		defaultValue: '#3399cc'
	}),
	numMembers: DS.attr('number'),

	org: DS.belongsTo('organization'),
	hasInactivePhone: DS.attr('boolean'),
	phone: DS.belongsTo('phone'),
	location: DS.belongsTo('location'),

	// Not attributes
	// --------------

	type: 'team',
	actions: null,
	phoneAction: null, // one of number, transfer, deactivate
	phoneActionData: null,

	// Computed properties
	// -------------------

	locationIsDirty: alias('location.isDirty'),
	phoneIsDirty: alias('phone.isDirty'),
	hasPhoneAction: notEmpty('phoneAction'),
	hasPhoneActionData: notEmpty('phoneActionData'), // not all actions have data!
	hasActions: notEmpty('actions'),
	hasManualChanges: or('hasActions', 'phoneIsDirty', 'hasPhoneAction',
		'locationIsDirty'),

	urlIdentifier: Ember.computed('name', function() {
		return Ember.String.dasherize(this.get('name') || '');
	}),
	transferId: Ember.computed('id', function() {
		return `team-${this.get('id')}`;
	}),
	transferFilter: Ember.computed('name', 'location.content.address', function() {
		const name = this.get('name'),
			address = this.get('location.content.address');
		return `${name},${address}`;
	})
});
