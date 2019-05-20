import { guidFor } from '@ember/object/internals';
import $ from 'jquery';
import Evented from '@ember/object/evented';
import Service from '@ember/service';
import { computed } from '@ember/object';
import config from 'textup-frontend/config/environment';

export const STATE_VISIBLE = 'visible';
export const STATE_PROP_NAME = 'visibilityState';

export default Service.extend(Evented, {
  willDestroy() {
    this._super(...arguments);
    $(window).off(this._wrapEvent());
    $(document).off(this._wrapEvent());
  },

  // Properties
  // ----------

  isVisible: true,

  // Methods
  // -------

  startWatchingVisibilityChanges() {
    if (this._noPageVisibility()) {
      $(window)
        .on(this._wrapEvent('blur'), this._markHidden.bind(this))
        .on(this._wrapEvent('focus'), this._markVisible.bind(this));
      this._markVisible();
    } else {
      $(document).on(this._wrapEvent('visibilitychange'), this._checkVisibility.bind(this));
      this._checkVisibility();
    }
  },

  // Internal
  // --------

  _guid: computed(function() {
    return guidFor(this);
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
