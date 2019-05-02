import config from 'textup-frontend/config/environment';
import Ember from 'ember';

// see https://github.com/wordset/visible for inspiration

const { computed } = Ember;

export const STATE_VISIBLE = 'visible';
export const STATE_PROP_NAME = 'visibilityState';

export default Ember.Service.extend(Ember.Evented, {
  init() {
    this._super(...arguments);
    if (this._noPageVisibility()) {
      Ember.$(window)
        .on(this._wrapEvent('blur'), this._markHidden.bind(this))
        .on(this._wrapEvent('focus'), this._markVisible.bind(this));
      this._markVisible();
    } else {
      Ember.$(document).on(this._wrapEvent('visibilitychange'), this._checkVisibility.bind(this));
      this._checkVisibility();
    }
  },
  willDestroy() {
    this._super(...arguments);
    Ember.$(window).off(this._wrapEvent());
    Ember.$(document).off(this._wrapEvent());
  },

  // Properties
  // ----------

  isVisible: true,

  // Internal
  // --------

  _guid: computed(function() {
    return Ember.guidFor(this);
  }),

  _noPageVisibility() {
    return document[STATE_PROP_NAME] === undefined;
  },
  _checkVisibility() {
    const state = document[STATE_PROP_NAME];
    if (state === STATE_VISIBLE) {
      this._markVisible();
    } else {
      this._markHidden();
    }
  },
  _markVisible() {
    this.set('isVisible', true);
    this.trigger(config.events.visibility.visible);
  },
  _markHidden() {
    this.set('isVisible', false);
    this.trigger(config.events.visibility.hidden);
  },

  _wrapEvent(event = '') {
    return `${event}.${this.get('_guid')}`;
  },
});
