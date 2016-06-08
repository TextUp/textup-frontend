import DS from 'ember-data';
import {
	validator,
	buildValidations
} from 'ember-cp-validations';

const Validations = buildValidations({
	awayMessage: {
		description: 'Away Message',
		validators: [
			validator('length', {
				allowBlank: false,
				min: 1,
				max: 160
			})
		]
	}
});

export default DS.Model.extend(Validations, {
	init: function() {
		this._super(...arguments);
		this.set('contacts', []);
	},

	// Attributes
	// ----------

	number: DS.attr('phone-number'),
	awayMessage: DS.attr('string', {
		defaultValue: ''
	}),
	tags: DS.hasMany('tag'),

	// Not attributes
	// --------------

	contacts: null,
});
