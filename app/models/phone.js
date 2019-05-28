import AppUtils from 'textup-frontend/utils/app';
import Constants from 'textup-frontend/constants';
import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import DS from 'ember-data';
import MF from 'ember-data-model-fragments';
import { computed } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  awayMessage: {
    description: 'Away Message',
    validators: [
      validator('length', {
        allowBlank: false,
        min: 1,
        max: readOnly('model.awayMessageMaxLength'),
      }),
    ],
  },
});

export default DS.Model.extend(Dirtiable, Validations, {
  // Overrides
  // ---------

  rollbackAttributes() {
    AppUtils.tryRollback(this.get('media.content'));
    return this._super(...arguments);
  },
  hasManualChanges: computed('media.isDirty', function() {
    return !!this.get('media.isDirty');
  }),

  // Properties
  // ----------

  awayMessage: DS.attr('string', { defaultValue: '' }),
  awayMessageMaxLength: DS.attr('number', { defaultValue: 320 }),

  number: DS.attr('phone-number'),
  isActive: DS.attr('boolean'),
  voice: DS.attr('string'),
  language: DS.attr('string', { defaultValue: Constants.DEFAULT.LANGUAGE }),

  media: DS.belongsTo('media'), // hasOne
  requestVoicemailGreetingCall: DS.attr(),
  useVoicemailRecordingIfPresent: DS.attr('boolean'),
  allowSharingWithOtherTeams: DS.attr('boolean'),

  tags: DS.hasMany('tag'),
  policies: MF.fragmentArray('owner-policy'),
});
