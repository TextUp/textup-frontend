import Ember from 'ember';
import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';

const { isPresent, computed, computed: { equal: eq, or, alias } } = Ember,
  Validations = buildValidations({
    name: {
      description: 'Name',
      validators: [validator('presence', true)]
    },
    location: {
      description: 'Location',
      validators: [validator('presence', true), validator('belongs-to')]
    }
  });

export default DS.Model.extend(Validations, {
  name: DS.attr('string'),
  status: DS.attr('string'),
  numAdmins: DS.attr('number'),

  location: DS.belongsTo('location'),
  teams: DS.hasMany('team'),

  timeout: DS.attr('number'),

  // Computed properties
  // -------------------

  isRejected: eq('status', 'REJECTED'),
  isPending: eq('status', 'PENDING'),
  isApproved: eq('status', 'APPROVED'),

  existingTeams: computed('teams.[]', function() {
    return DS.PromiseArray.create({
      promise: new Promise((resolve, reject) => {
        this.get('teams').then(teams => {
          resolve(teams.filterBy('isNew', false));
        }, reject);
      })
    });
  }),

  timeoutInSeconds: computed('timeout', {
    get: function() {
      return this.get('timeout') / 1000;
    },
    set: function(key, value) {
      if (this.get('isDeleted') === false && isPresent(value)) {
        this.set('timeout', value * 1000);
      }
      return value;
    }
  }),
  isTimeout15: eq('timeoutInSeconds', 15),
  isTimeout30: eq('timeoutInSeconds', 30),
  isTimeout60: eq('timeoutInSeconds', 60),
  isTimeoutStandard: or('isTimeout15', 'isTimeout30', 'isTimeout60'),

  hasManualChanges: alias('location.isDirty')
});
