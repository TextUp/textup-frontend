import Dirtiable from '../mixins/model/dirtiable';
import DS from 'ember-data';
import Ember from 'ember';
import moment from 'moment';
import { validator, buildValidations } from 'ember-cp-validations';

const { computed, get, tryInvoke, getWithDefault } = Ember,
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
          description: 'message body, images, or audio recordings'
        })
      ]
    },
    intervalSize: {
      disabled(model) {
        return !model.get('isRepeating');
      },
      dependentKeys: ['isRepeating'],
      description: 'Repeat interval size in days',
      validators: [validator('number', { allowString: true, gt: 0 })]
    },
    repeatInterval: {
      disabled(model) {
        return !model.get('isRepeating');
      },
      dependentKeys: ['isRepeating'],
      description: 'Repeat interval',
      validators: [validator('number', { allowString: true, gt: 0 })]
    },
    repeatCount: {
      disabled(model) {
        return !model.get('isRepeating');
      },
      dependentKeys: ['isRepeating'],
      description: 'Number of times to repeat',
      validators: [
        validator('number', { allowBlank: true, allowString: true, gt: 0 }),
        validator('has-any', {
          also: ['endDate'],
          description: 'number of times or end date to stop after'
        })
      ]
    }
  });

export default DS.Model.extend(Dirtiable, Validations, {
  constants: Ember.inject.service(),

  // Overrides
  // ---------

  rollbackAttributes: function() {
    tryInvoke(getWithDefault(this, 'media.content', {}), 'rollbackAttributes');
    return this._super(...arguments);
  },
  didUpdate() {
    this._super(...arguments);
    this.rollbackAttributes();
  },
  hasManualChanges: computed('media.isDirty', function() {
    return !!this.get('media.isDirty');
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
        defaultInterval = model.get('constants.DEFAULT.TIME_INTERVAL_IN_MINUTES');
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

  owner: computed('contact', 'tag', {
    get() {
      return this.get('tag.content') ? this.get('tag') : this.get('contact');
    },
    set(key, value) {
      const modelName = get(value || {}, 'constructor.modelName');
      if (modelName === this.get('constants.MODEL.CONTACT')) {
        this.setProperties({ contact: value, tag: null });
        return this.get('contact');
      } else if (modelName === this.get('constants.MODEL.TAG')) {
        this.setProperties({ contact: null, tag: value });
        return this.get('tag');
      } else {
        return value;
      }
    }
  }),

  intervalSize: computed('_intervalSize', {
    get() {
      return this.get('_intervalSize');
    },
    set(key, rawSize) {
      const size = parseInt(rawSize);
      if (!this.get('isDeleted') && !isNaN(size)) {
        this.setProperties({
          _repeatIntervalInDays: buildNewIntervalInDays(this.get('repeatInterval'), size),
          _intervalSize: size
        });
      }
      return rawSize; // avoid NaN error messages that may happen with returning `size`
    }
  }),
  repeatInterval: computed('_repeatInterval', {
    get() {
      return this.get('_repeatInterval');
    },
    set(key, rawInterval) {
      const interval = parseInt(rawInterval);
      if (!this.get('isDeleted') && !isNaN(interval)) {
        this.setProperties({
          _repeatIntervalInDays: buildNewIntervalInDays(interval, this.get('intervalSize')),
          _repeatInterval: interval
        });
      }
      return rawInterval; // avoid NaN error messages that may happen with returning `interval`
    }
  }),

  // Private Properties
  // ------------------

  _repeatInterval: computed(function() {
    return this.get('_repeatIntervalInDays');
  }),
  _intervalSize: computed(function() {
    return this.get('constants.FUTURE_MESSAGE.INTERVAL_SIZE.DAY');
  }),
  _repeatIntervalInDays: DS.attr('number')
});

function buildNewIntervalInDays(interval, intervalSize) {
  return !isNaN(interval) && !isNaN(intervalSize) ? interval * intervalSize : null;
}
