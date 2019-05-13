import config from 'textup-frontend/config/environment';
import Ember from 'ember';
import PlatformUtils from 'textup-frontend/utils/platform';

// For initial outline of code, see https://github.com/racido/broccoli-manifest
// For AppCache update API, see https://www.html5rocks.com/en/tutorials/appcache/beginner/#toc-updating-cache

export const UPDATE_MESSAGE = 'A new version of TextUp is available. Install now?';

export function tryTriggerAppUpdate() {
  try {
    if (window.applicationCache.status !== window.applicationCache.UNCACHED) {
      window.applicationCache.update();
    }
  } catch (e) {
    Ember.debug('_tryTriggerAppUpdate', e);
  }
}

export function swapCacheAndReload() {
  if (
    window.applicationCache.status === window.applicationCache.UPDATEREADY &&
    window.confirm(UPDATE_MESSAGE)
  ) {
    window.applicationCache.swapCache();
    PlatformUtils.tryReloadWindow();
  }
}

export default Ember.Service.extend({
  authService: Ember.inject.service(),
  lockService: Ember.inject.service(),

  willDestroy() {
    this._super(...arguments);
    if (this.get('_hasBoundEvents')) {
      window.applicationCache.removeEventListener('updateready', swapCacheAndReload);
      Ember.$(window).off('load', tryTriggerAppUpdate);
      this.get('authService')
        .off(config.events.auth.success, this)
        .off(config.events.auth.clear, this);
      this.get('lockService').off(config.events.lock.unlocked, this);
    }
  },

  // Methods
  // -------

  trySetUpAndWatchUpdateEvents() {
    if (PlatformUtils.isAppCacheCapable()) {
      this.set('_hasBoundEvents', true);
      // handles the outcome of the update checking
      window.applicationCache.addEventListener('updateready', swapCacheAndReload, false);
      // checks for update after the page has finished loading for the first time
      Ember.$(window).on('load', tryTriggerAppUpdate);
      // checks for update at key points of the user flow so that the user can receive timely
      // updates even if the page is not often reloaded (e.g., iOS PWAs)
      this.get('authService')
        .on(config.events.auth.success, this, tryTriggerAppUpdate)
        .on(config.events.auth.clear, this, tryTriggerAppUpdate);
      this.get('lockService').on(config.events.lock.unlocked, this, tryTriggerAppUpdate);
    }
  },

  // Internal
  // --------

  _hasBoundEvents: false,
});
