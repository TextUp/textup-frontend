import Dirtiable from '../mixins/model/dirtiable';
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

export default DS.Model.extend(Dirtiable, Validations, {
  init() {
    this._super(...arguments);
    this.set('contacts', []);
  },

  rollbackAttributes: function() {
    this._super(...arguments);
    this.get('availability').then(a1 => a1 && a1.rollbackAttributes());
  },

  // Attributes
  // ----------

  number: DS.attr('phone-number'),
  awayMessage: DS.attr('string', { defaultValue: '' }),
  mandatoryEmergencyMessage: DS.attr('string', { defaultValue: '' }),
  tags: DS.hasMany('tag'),
  voice: DS.attr('string'),
  language: DS.attr('string', {
    defaultValue: 'ENGLISH'
  }),

  availability: DS.belongsTo('availability'),
  others: DS.hasMany('availability'),

  // Computed properties
  // -------------------

  awayMessageMaxLength: computed('mandatoryEmergencyMessage', function() {
    return 160 - this.get('mandatoryEmergencyMessage.length');
  }),
  hasManualChanges: computed.alias('availability.isDirty'),

  // Not attributes
  // --------------

  contacts: null
});
