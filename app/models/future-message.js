import Dirtiable from '../mixins/model/dirtiable';
import DS from 'ember-data';
import Ember from 'ember';
import moment from 'moment';
import { validator, buildValidations } from 'ember-cp-validations';

const { computed, typeOf } = Ember,
  Validations = buildValidations({
    type: validator('inclusion', {
      in: model => Object.values(model.get('constants.FUTURE_MESSAGE.TYPE'))
    }),
    message: {
      description: 'Message',
      validators: [
        validator('length', { max: 320 }),
        validator('has-any', {
          also: ['media.hasElements'],
          // see `valdiators/has-any` for why we need to manually specify dependent key here
          dependentKeys: ['media.hasElements'],
          description: 'message body or images'
        })
      ]
    },
    intervalSize: {
      description: 'Repeat interval size in days',
      validators: [validator('number', { allowBlank: true, allowString: true, gt: 0 })]
    },
    repeatInterval: {
      description: 'Repeat interval',
      validators: [validator('number', { allowBlank: true, allowString: true, gt: 0 })]
    },
    repeatCount: {
      description: 'Number of times to repeat',
      validators: [validator('number', { allowBlank: true, allowString: true, gt: 0 })]
    }
  });

export default DS.Model.extend(Dirtiable, Validations, {
  constants: Ember.inject.service(),

  // Overrides
  // ---------

  rollbackAttributes: function() {
    this._super(...arguments);
    this.set('intervalSize', this.get('constants.FUTURE_MESSAGE.INTERVAL_SIZE.DAY'));
  },
  didUpdate: function() {
    this._super(...arguments);
    this.rollbackAttributes();
  },
  hasManualChanges: computed('intervalSize', 'media.isDirty', function() {
    return (
      this.get('intervalSize') !== this.get('constants.FUTURE_MESSAGE.INTERVAL_SIZE.DAY') ||
      !!this.get('media.isDirty')
    );
  }),

  // Properties
  // ----------

  whenCreated: DS.attr('date'),
  nextFireDate: DS.attr('date'),
  isDone: DS.attr('boolean', { defaultValue: false }),
  notifySelf: DS.attr('boolean', { defaultValue: false }),
  timesTriggered: DS.attr('number', { defaultValue: 0 }),
  isRepeating: DS.attr('boolean', { defaultValue: false }),
  repeatCount: DS.attr('number'),
  startDate: DS.attr('date', {
    defaultValue: model => {
      const momentObj = moment(),
        defaultInterval = model.get('constants.DEFAULT_TIME_INTERVAL_IN_MINUTES');
      return momentObj
        .minutes(Math.floor(momentObj.minutes() / defaultInterval) * defaultInterval)
        .toDate();
    }
  }),
  hasEndDate: DS.attr('boolean', { defaultValue: false }),
  endDate: DS.attr('date'),
  type: DS.attr('string', {
    defaultValue: model => model.get('constants.FUTURE_MESSAGE.TYPE.TEXT')
  }),
  language: DS.attr('string'),
  message: DS.attr('string'),

  media: DS.belongsTo('media'), // hasOne
  contact: DS.belongsTo('contact'), // hasOne
  tag: DS.belongsTo('tag'), // hasOne

  intervalSize: computed('_intervalSize', {
    get() {
      const size = this.get('_intervalSize'),
        fallbackSize = this.get('constants.FUTURE_MESSAGE.INTERVAL_SIZE.DAY');
      return typeOf(size) === 'number' ? size : fallbackSize;
    },
    set(key, size) {
      if (!this.get('isDeleted')) {
        this.setProperties({
          _repeatIntervalInDays: buildNewIntervalInDays(this.get('repeatInterval'), size),
          _intervalSize: size
        });
      }
      return size;
    }
  }),
  repeatInterval: computed('_repeatInterval', {
    get() {
      return this.get('_repeatInterval');
    },
    set(key, interval) {
      if (!this.get('isDeleted')) {
        this.setProperties({
          _repeatIntervalInDays: buildNewIntervalInDays(interval, this.get('intervalSize')),
          _repeatInterval: interval
        });
      }
      return interval;
    }
  }),

  // Private Properties
  // ------------------

  _repeatInterval: null,
  _intervalSize: null,
  _repeatIntervalInDays: DS.attr('number')
});

function buildNewIntervalInDays(interval, intervalSize) {
  return typeOf(interval) === 'number' && typeOf(intervalSize) === 'number'
    ? interval * intervalSize
    : null;
}
