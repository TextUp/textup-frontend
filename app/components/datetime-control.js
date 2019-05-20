import { scheduleOnce, next } from '@ember/runloop';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isPresent, tryInvoke } from '@ember/utils';
import { and } from '@ember/object/computed';
import callIfPresent from 'textup-frontend/utils/call-if-present';
import HasWormhole from 'textup-frontend/mixins/component/has-wormhole';
import moment from 'moment';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Component.extend(PropTypesMixin, HasWormhole, {
  propTypes: {
    datePlaceholder: PropTypes.string,
    timePlaceholder: PropTypes.string,
    dateFormat: PropTypes.string,
    timeFormat: PropTypes.string,
    timeInterval: PropTypes.number,
    min: PropTypes.oneOfType([PropTypes.null, PropTypes.date]),
    max: PropTypes.oneOfType([PropTypes.null, PropTypes.date]),
    disabled: PropTypes.bool,
    showDate: PropTypes.bool,
    showTime: PropTypes.bool,
    value: PropTypes.oneOfType([PropTypes.null, PropTypes.date]), // cannot be number because time input does not populate correctly
    onSelect: PropTypes.func,
  },
  getDefaultProps() {
    return {
      datePlaceholder: 'Select date',
      timePlaceholder: 'Select time',
      dateFormat: 'ddd mmm d, yyyy',
      timeFormat: 'h:i A',
      timeInterval: 1,
      disabled: false,
      showDate: true,
      showTime: true,
      wormholeClass: 'datetime-control-wormhole',
    };
  },

  // Properties
  // ----------

  classNames: 'datetime-control',

  // Internal properties
  // -------------------

  // keep track of an interval copy of the value that we manually sync
  // with the actual value to avoid multiple render issues
  _value: null,
  // All updates manually set via `_tryUpdateTimeOptions`
  _timeOptions: computed(function() {
    return this._buildTimeOptions();
  }),
  // updating the time options hash refires the select action,
  // so we need to short-circuit the select action while the component
  // re-renders so that we don't create an infinite loop of
  // select action calls
  _isRerenderingControls: false,

  // Computed properties
  // -------------------

  showBoth: and('showDate', 'showTime'),
  mValue: computed('_value', function() {
    const val = this.get('_value');
    return isPresent(val) ? moment(val) : null;
  }),
  mMin: computed('min', function() {
    const val = this.get('min');
    return isPresent(val) ? moment(val) : null;
  }),
  mMax: computed('max', function() {
    const val = this.get('max');
    return isPresent(val) ? moment(val) : null;
  }),

  isValueSameDayAsMin: computed('mValue', 'mMin', function() {
    return this._isSameDay(this.get('mValue'), this.get('mMin'));
  }),
  isValueSameDayAsMax: computed('mValue', 'mMax', function() {
    return this._isSameDay(this.get('mValue'), this.get('mMax'));
  }),

  _dateOptions: computed('dateFormat', 'mMin', 'max', function() {
    const options = {
        format: this.get('dateFormat'),
      },
      mMin = this.get('mMin'),
      max = this.get('max');
    if (mMin) {
      options.min = mMin.toDate();
      if (mMin.isAfter(new Date())) {
        // if is after now, hide 'Today'
        options.today = '';
      }
    }
    if (max) {
      options.max = max;
    }
    return options;
  }),
  _elementToWormhole: computed(function() {
    return this.$('.picker');
  }),

  // Events
  // ------

  didInsertElement() {
    this._super(...arguments);
    scheduleOnce('afterRender', this, function() {
      this._setValue(this.get('value'));
      // must be called AFTER _value is set. Use this helper method to set time options
      // instead of directly setting time options because directly setting will trigger
      // an infinite rendering loop
      this._tryUpdateTimeOptions();
    });
  },
  didUpdateAttrs() {
    // manually manage the state of the time options object
    this._tryUpdateTimeOptions();
  },

  // Actions
  // -------

  actions: {
    onSelect(newVal) {
      // select hook is called repeatedly on re-render
      if (this.get('_isRerenderingControls')) {
        // during the re-rendering process the value might be adjusted
        // to fit within the new boundaries. We don't want to lose this
        // information, but we cannot directly set the value because
        // we are in the rendering process and doing so would
        // trigger a multiple render deprecation (in 2.4.5).
        // Therefore, we will set the updated value after the rendering
        // process has finished
        if (moment(newVal).isSame(this.get('_value')) === false) {
          scheduleOnce('afterRender', this, this._setValue, newVal);
        }
      } else {
        // first set the interval copy of the value immediately
        // so that the picker can update ranges properly
        this._setValue(newVal);
        // then schedule the onSelect hook to be called to update
        // the actual copy of the value. Scheduling instead of calling
        // synchronously allows Ember to appropriate space out value
        // modifications so that the same value isn't modified twice
        // in a render, triggering a multiple modification deprecation
        scheduleOnce('afterRender', this, function() {
          if (!this.isDestroying && !this.isDestroyed) {
            tryInvoke(this, 'onSelect', [newVal]);
            this._tryUpdateTimeOptions(() =>
              tryInvoke(this, 'onSelect', [this.get('_value')])
            );
          }
        });
      }
    },
  },

  // Helpers
  // -------

  _isSameDay(moment1, moment2) {
    return isPresent(moment1) && isPresent(moment2) ? moment2.isSame(moment1, 'day') : false;
  },

  _setValue(val) {
    if (this.isDestroying || this.isDestroyed || !val) {
      return;
    }
    let newVal = val;
    const $picker = this.get('_elementToWormhole');
    if ($picker && $picker.hasClass('picker--time')) {
      const lastOptionNumMinutes = $picker
          .find('.picker__list-item')
          .last()
          .data('pick'),
        { hours, minutes } = this._extractHoursAndMinutesFromPickData(lastOptionNumMinutes);
      // if `hours` and `minutes` are both defined, then we have successfully extracted data
      // then, if the value has a time that comes after the last available option, we need
      // to adjust the value's time to the last available option or else we'll overflow and
      // the displayed time will be either the minimum time or will be midnight.
      if (hours && minutes && val.getHours() >= hours && val.getMinutes() > minutes) {
        newVal = new Date(val.getTime()); // clone datetime object
        newVal.setHours(hours);
        newVal.setMinutes(minutes);
      }
    }
    this.set('_value', newVal);
  },
  _extractHoursAndMinutesFromPickData(pickDataNum) {
    if (isNaN(pickDataNum)) {
      return { hours: null, minutes: null };
    }
    const decimalFormAsString = (parseInt(pickDataNum) / 60).toFixed(2),
      decimalIndex = decimalFormAsString.indexOf('.');
    return {
      hours: parseInt(decimalFormAsString.slice(0, decimalIndex)),
      minutes: (parseInt(decimalFormAsString.slice(decimalIndex + 1)) / 100) * 60,
    };
  },

  _tryUpdateTimeOptions(then) {
    const options = this.get('_timeOptions'),
      format = this.get('timeFormat'),
      isValueSameDayAsMin = this.get('isValueSameDayAsMin'),
      isValueSameDayAsMax = this.get('isValueSameDayAsMax'),
      min = this._includeIfSameDay(isValueSameDayAsMin, this.get('min')),
      max = this._includeIfSameDay(isValueSameDayAsMax, this.get('max'));
    // should short circuit if nothing has changed
    if (
      options &&
      options.format === format &&
      options.isValueSameDayAsMin === isValueSameDayAsMin &&
      options.isValueSameDayAsMax === isValueSameDayAsMax &&
      options.min === min &&
      options.max === max
    ) {
      return;
    }
    // otherwise, update the boundary conditions and re-render controls
    // select hook is called repeatedly on re-render so
    // we need to short circuit the select hook to avoid an infinite loop
    this.set('_isRerenderingControls', true);
    this.set('_timeOptions', this._buildTimeOptions());
    // after rendering is done, stop short circuiting select hook
    // also, pass the possibly new value that falls within the new
    // boundaries up to the application
    next(() => {
      if (!this.isDestroying && !this.isDestroyed) {
        this.set('_isRerenderingControls', false);
        callIfPresent(this, then);
      }
    });
  },
  _buildTimeOptions() {
    // Need to initialize object as {} and not Object.create(null)
    // because picker calls `hasOwnProperty`, which is only added using the {} constructor
    const options = {
        format: this.get('timeFormat'),
      },
      forMin = this.get('isValueSameDayAsMin'),
      forMax = this.get('isValueSameDayAsMax');
    options.isValueSameDayAsMin = forMin;
    options.min = this._includeIfSameDay(forMin, this.get('min'));
    options.isValueSameDayAsMax = forMax;
    options.max = this._includeIfSameDay(forMax, this.get('max'));
    options.interval = this.get('timeInterval');
    return options;
  },
  _includeIfSameDay(isSameDay, val) {
    return isSameDay ? val : false;
  },
});
