import DS from 'ember-data';
import Ember from 'ember';

const {
	notEmpty,
	or
} = Ember.computed;

export default DS.Model.extend({

	init: function() {
		this._super(...arguments);
		this.set('actions', []);
	},

	// Attributes
	// ----------

	name: DS.attr('string'),
	hexColor: DS.attr('string'),
	awayMessage: DS.attr('string'),
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

	hasActions: notEmpty('actions'),
	hasNewPhone: notEmpty('newPhone'),
	hasManualChanges: or('hasActions', 'hasNewPhone'),
	urlIdentifier: Ember.computed('name', function() {
		return Ember.String.dasherize(this.get('name') || '');
	}),
});
