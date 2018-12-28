import Dirtiable from '../mixins/model/dirtiable';
import Ember from 'ember';
import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';

const { isPresent, computed, RSVP } = Ember,
  Validations = buildValidations({
    name: { description: 'Name', validators: [validator('presence', true)] },
    location: {
      description: 'Location',
      validators: [validator('presence', true), validator('belongs-to')]
    },
    timeout: {
      description: 'Lock timeout',
      validators: [
        validator('number', {
          allowBlank: true,
          gte: model => model.get('timeoutMin'),
          lte: model => model.get('timeoutMax')
        })
      ]
    },
    awayMessageSuffix: {
      description: 'Message to add to end of all away messages',
      validators: [
        validator('length', {
          allowNone: true,
          allowBlank: true,
          max: model => model.get('awayMessageSuffixMaxLength')
        })
      ]
    }
  });

export default DS.Model.extend(Dirtiable, Validations, {
  constants: Ember.inject.service(),

  // Overrides
  // ---------

  hasManualChanges: computed('location.isDirty', function() {
    return !!this.get('location.isDirty');
  }),

  // Properties
  // ----------

  name: DS.attr('string'),
  numAdmins: DS.attr('number'),
  location: DS.belongsTo('location'),

  status: DS.attr('string'),
  isRejected: computed('status', function() {
    return this.get('status') === this.get('constants.ORGANIZATION.STATUS.REJECTED');
  }),
  isPending: computed('status', function() {
    return this.get('status') === this.get('constants.ORGANIZATION.STATUS.PENDING');
  }),
  isApproved: computed('status', function() {
    return this.get('status') === this.get('constants.ORGANIZATION.STATUS.APPROVED');
  }),

  teams: DS.hasMany('team'),
  existingTeams: computed('teams.[]', function() {
    return DS.PromiseArray.create({
      promise: new RSVP.Promise((resolve, reject) => {
        this.get('teams').then(teams => resolve(teams.filterBy('isNew', false)), reject);
      })
    });
  }),

  timeout: DS.attr('number'),
  timeoutMin: DS.attr('number', { defaultValue: 15000 }),
  timeoutMax: DS.attr('number', { defaultValue: 60000 }),
  timeoutInSeconds: computed('timeout', {
    get() {
      return this.get('timeout') / 1000;
    },
    set(key, value) {
      if (this.get('isDeleted') === false && isPresent(value)) {
        this.set('timeout', value * 1000);
      }
      return value;
    }
  }),
  isTimeout15: computed.equal('timeoutInSeconds', 15),
  isTimeout30: computed.equal('timeoutInSeconds', 30),
  isTimeout60: computed.equal('timeoutInSeconds', 60),
  isTimeoutStandard: computed.or('isTimeout15', 'isTimeout30', 'isTimeout60'),

  awayMessageSuffix: DS.attr('string', { defaultValue: '' }),
  awayMessageSuffixMaxLength: DS.attr('number', { defaultValue: 159 })
});
