import callIfPresent from '../utils/call-if-present';
import Ember from 'ember';
import moment from 'moment';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { computed, isPresent, computed: { and } } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
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
    wormholeClass: PropTypes.string
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
      wormholeClass: 'datetime-control-wormhole'
    };
  },

  // Properties
  // ----------

  classNames: 'datetime-control',

  // Internal properties
  // -------------------

  // keep track of an interval copy of the value that we manually sync
  // with the actual value to avoid multiple render issues
  _value: computed(function() {
    return this.get('value');
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

  dateOptions: computed('dateFormat', 'mMin', 'max', function() {
    const options = {
        format: this.get('dateFormat')
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
  // initialize time options here. All updates manually set via `_tryUpdateTimeOptions`
  timeOptions: computed(function() {
    return this._buildTimeOptions();
  }),
  destination: computed(function() {
    return `${this.elementId}--wormhole`;
  }),
  $wormholeParent: computed(function() {
    const rootSelector = Ember.testing
      ? '#ember-testing'
      : Ember.getOwner(this).lookup('application:main').rootElement;
    return Ember.$(rootSelector);
  }),
  $wormhole: computed('destination', 'wormholeClass', function() {
    const destination = this.get('destination'),
      wormholeClass = this.get('wormholeClass');
    return Ember.$(`<div id='${destination}' class='${wormholeClass}'></div>`);
  }),

  // Events
  // ------

  init: function() {
    this._super(...arguments);
    this.get('$wormholeParent').append(this.get('$wormhole'));
  },
  didInsertElement: function() {
    this._super(...arguments);
    this.$('.picker') // move all instance of picker to the wormhole
      .detach()
      .appendTo(this.get('$wormhole'));
  },
  willDestroyElement: function() {
    this._super(...arguments);
    this.get('$wormhole').remove();
  },
  didUpdateAttrs: function() {
    // manually manage the state of the time options object
    this._tryUpdateTimeOptions();
  },

  // Actions
  // -------

  actions: {
    onSelect: function(newVal) {
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
          Ember.run.scheduleOnce('afterRender', this, function() {
            if (!this.isDestroying && !this.isDestroyed) {
              this.set('_value', newVal);
            }
          });
        }
      } else {
        // first set the interval copy of the value immediately
        // so that the picker can update ranges properly
        this.set('_value', newVal);
        // then schedule the onSelect hook to be called to update
        // the actual copy of the value. Scheduling instead of calling
        // synchronously allows Ember to appropriate space out value
        // modifications so that the same value isn't modified twice
        // in a render, triggering a multiple modification deprecation
        Ember.run.scheduleOnce('afterRender', this, function() {
          if (!this.isDestroying && !this.isDestroyed) {
            const selectHook = this.get('onSelect');
            callIfPresent(selectHook, newVal);
            this._tryUpdateTimeOptions(() => callIfPresent(selectHook, this.get('_value')));
          }
        });
      }
    }
  },

  // Helpers
  // -------

  _isSameDay: function(moment1, moment2) {
    return isPresent(moment1) && isPresent(moment2) ? moment2.isSame(moment1, 'day') : false;
  },

  _tryUpdateTimeOptions: function(then) {
    const options = this.get('timeOptions'),
      format = this.get('timeFormat'),
      isValueSameDayAsMin = this.get('isValueSameDayAsMin'),
      isValueSameDayAsMax = this.get('isValueSameDayAsMax'),
      min = this._includeIfSameDay(isValueSameDayAsMin, this.get('min')),
      max = this._includeIfSameDay(isValueSameDayAsMax, this.get('max'));
    // should short circuit if nothing has changed
    if (
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
    this.set('timeOptions', this._buildTimeOptions());
    // after rendering is done, stop short circuiting select hook
    // also, pass the possibly new value that falls within the new
    // boundaries up to the application
    Ember.run.next(() => {
      if (!this.isDestroying && !this.isDestroyed) {
        this.set('_isRerenderingControls', false);
        callIfPresent(then);
      }
    });
  },
  _buildTimeOptions: function() {
    // Need to initialize object as {} and not Object.create(null)
    // because picker calls `hasOwnProperty`, which is only added using the {} constructor
    const options = {
        format: this.get('timeFormat')
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
  }
});
