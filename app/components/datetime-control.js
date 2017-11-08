import callIfPresent from '../utils/call-if-present';
import defaultIfAbsent from '../utils/default-if-absent';
import Ember from 'ember';
import moment from 'moment';

const { computed, isPresent, computed: { and } } = Ember;

export default Ember.Component.extend({
  datePlaceholder: defaultIfAbsent('Select date'),
  timePlaceholder: defaultIfAbsent('Select time'),

  dateFormat: defaultIfAbsent('ddd mmm d, yyyy'),
  timeFormat: defaultIfAbsent('h:i A'),
  timeInterval: defaultIfAbsent(1),

  min: null,
  max: null,

  disabled: defaultIfAbsent(false),
  showDate: defaultIfAbsent(true),
  showTime: defaultIfAbsent(true),

  value: null,
  onSelect: null,

  wormholeClass: defaultIfAbsent('datetime-control-wormhole'),
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
  timeOptions: computed('timeFormat', 'timeInterval', function() {
    return this._addBoundariesToTimeOptions({
      format: this.get('timeFormat'),
      interval: this.get('timeInterval')
    });
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
            this.set('_value', newVal);
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
          callIfPresent(this.get('onSelect'), newVal);
          this._doUpdateTimeOptions();
        });
      }
    }
  },

  // Helpers
  // -------

  _isSameDay: function(moment1, moment2) {
    return isPresent(moment1) && isPresent(moment2) ? moment2.isSame(moment1, 'day') : false;
  },
  _addBoundariesToTimeOptions: function(options) {
    const forMin = this.get('isValueSameDayAsMin'),
      forMax = this.get('isValueSameDayAsMax');
    options.isValueSameDayAsMin = forMin;
    options.min = forMin ? this.get('min') : false;
    options.isValueSameDayAsMax = forMax;
    options.max = forMax ? this.get('max') : false;
    return options;
  },

  _doUpdateTimeOptions: function() {
    const isValueSameDayAsMin = this.get('isValueSameDayAsMin'),
      isValueSameDayAsMax = this.get('isValueSameDayAsMax'),
      options = this.get('timeOptions');
    // should short circuit if boundary status
    if (
      options.isValueSameDayAsMin === isValueSameDayAsMin &&
      options.isValueSameDayAsMax === isValueSameDayAsMax
    ) {
      return;
    }
    // otherwise, update the boundary conditions and re-render controls
    this._addBoundariesToTimeOptions(options);
    // select hook is called repeatedly on re-render so
    // we need to short circuit the select hook to avoid an infinite loop
    this.set('_isRerenderingControls', true);
    this.set('timeOptions', Ember.copy(options));
    // after rendering is done, stop short circuiting select hook
    // also, pass the possibly new value that falls within the new
    // boundaries up to the application
    Ember.run.next(() => {
      this.set('_isRerenderingControls', false);
      callIfPresent(this.get('onSelect'), this.get('_value'));
    });
  }
});
