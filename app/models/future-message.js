import DS from 'ember-data';
import Ember from 'ember';
import moment from 'moment';
import {
	validator,
	buildValidations
} from 'ember-cp-validations';

const {
	computed: {
		equal: eq,
		gt
	}
} = Ember,
Validations = buildValidations({
	type: validator('inclusion', { in : [
			'CALL', 'TEXT'
		]
	}),
	message: {
		description: 'Message',
		validators: [
			validator('length', {
				max: 320
			}),
			validator('presence', {
				presence: true,
				ignoreBlank: true
			})
		]
	},
	repeatIntervalInDays: {
		description: 'Repeat interval',
		validators: [
			validator('number', {
				allowBlank: true,
				allowString: true,
				positive: true
			})
		]
	},
	repeatCount: {
		description: 'Number of times to repeat',
		validators: [
			validator('number', {
				allowBlank: true,
				allowString: true,
				positive: true
			})
		]
	}
});

export default DS.Model.extend(Validations, {

	rollbackAttributes: function() {
		this._super(...arguments);
		this.set('intervalMultiplier', 1);
	},
	didUpdate: function() {
		this.rollbackAttributes();
	},

	// Attributes
	// ----------

	whenCreated: DS.attr('date'),
	isDone: DS.attr('boolean'),
	isRepeating: DS.attr('boolean', {
		defaultValue: false
	}),
	hasEndDate: DS.attr('boolean', {
		defaultValue: false
	}),
	nextFireDate: DS.attr('date'),
	timesTriggered: DS.attr('number'),
	startDate: DS.attr('date', {
		defaultValue: () => moment().add(1, 'day').toDate()
	}),

	type: DS.attr('string', {
		defaultValue: 'TEXT'
	}),
	message: DS.attr('string'),
	notifySelf: DS.attr('boolean', {
		defaultValue: false
	}),

	contact: DS.belongsTo('contact'),
	tag: DS.belongsTo('tag'),

	// Repeating
	// ---------

	repeatIntervalInDays: DS.attr('number'),
	repeatCount: DS.attr('number'),
	endDate: DS.attr('date'),

	// Not attributes
	// --------------

	intervalMultiplier: 1,
	contactId: null, // see adapter
	tagId: null, // see adapter

	// Computed properties
	// -------------------

	hasManualChanges: gt('intervalMultiplier', 1),
	isText: eq('type', 'TEXT'),
});
