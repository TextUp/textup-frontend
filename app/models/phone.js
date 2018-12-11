import Dirtiable from '../mixins/model/dirtiable';
import DS from 'ember-data';
import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
    awayMessage: {
      description: 'Away Message',
      validators: [
        validator('length', {
          allowBlank: false,
          min: 1,
          max: model => model.get('awayMessageMaxLength')
        })
      ]
    }
  }),
  { computed, getWithDefault, tryInvoke } = Ember;

export default DS.Model.extend(Dirtiable, Validations, {
  constants: Ember.inject.service(),

  // Overrides
  // ---------

  rollbackAttributes() {
    tryInvoke(getWithDefault(this, 'media.content', {}), 'rollbackAttributes');
    tryInvoke(getWithDefault(this, 'availability.content', {}), 'rollbackAttributes');
    return this._super(...arguments);
  },
  hasManualChanges: computed('availability.isDirty', 'media.isDirty', function() {
    return !!this.get('availability.isDirty') || !!this.get('media.isDirty');
  }),

  // Properties
  // ----------

  number: DS.attr('phone-number'),

  tags: DS.hasMany('tag'),
  contacts: computed(() => []),

  voice: DS.attr('string'),
  language: DS.attr('string', { defaultValue: model => model.get('constants.DEFAULT.LANGUAGE') }),

  media: DS.belongsTo('media'), // hasOne
  requestVoicemailGreetingCall: DS.attr(),
  useVoicemailRecordingIfPresent: DS.attr('boolean'),

  availability: DS.belongsTo('availability'),
  others: DS.hasMany('availability'),

  awayMessage: DS.attr('string', { defaultValue: '' }),
  awayMessageMaxLength: DS.attr('number', { defaultValue: 320 })
});
