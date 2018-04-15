import DS from 'ember-data';
import Ember from 'ember';
import moment from 'moment';
import { validator, buildValidations } from 'ember-cp-validations';

const { computed: { equal: eq, gt } } = Ember,
  Validations = buildValidations({
    type: validator('inclusion', {
      in: ['CALL', 'TEXT']
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
    defaultValue: () => {
      const m = moment();
      // round down to nearest 15 minutes, used number literals instead of the `timeInteralInMinutes`
      // variable because the context of this `defaultValue` method is NOT this model, as this
      // method is called before this model is done initializing
      return m.minutes(Math.floor(m.minutes() / 15) * 15).toDate();
    }
  }),
  timeIntervalInMinutes: 15, // NOT ATTRIBUTE, to control the interval datetime-control displays

  type: DS.attr('string', {
    defaultValue: 'TEXT'
  }),
  language: DS.attr('string'),
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
  isCall: eq('type', 'CALL')
});
