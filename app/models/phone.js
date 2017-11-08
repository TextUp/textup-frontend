import Ember from 'ember';
import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';

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
  }),
  { computed } = Ember;

export default DS.Model.extend(Validations, {
  init() {
    this._super(...arguments);
    this.set('contacts', []);
  },

  // Attributes
  // ----------

  number: DS.attr('phone-number'),
  awayMessage: DS.attr('string', { defaultValue: '' }),
  mandatoryEmergencyMessage: DS.attr('string', { defaultValue: '' }),
  tags: DS.hasMany('tag'),

  // Computed properties
  // -------------------

  awayMessageMaxLength: computed('mandatoryEmergencyMessage', function() {
    return 160 - this.get('mandatoryEmergencyMessage.length');
  }),

  // Not attributes
  // --------------

  contacts: null
});
