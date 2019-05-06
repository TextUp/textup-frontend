import config from 'textup-frontend/config/environment';
import Ember from 'ember';

// Provides a consistent interface for storage + syncing between tabs
// See http://blog.guya.net/2015/06/12/sharing-sessionstorage-between-tabs-for-secure-multi-tab-authentication/

const { computed, isPresent, run, RSVP, typeOf } = Ember;

export const KEY_REQUEST_SEND_STORAGE_FOR_THIS_TAB = 'textup-request-storage-data-to-be-sent';
export const KEY_RECEIVE_REQUESTED_STORAGE_FROM_OTHER_TAB = 'textup-receive-requested-storage-data';
export const STORAGE_EVENT_SYNC_TIMEOUT_IN_MS = 750;

export default Ember.Service.extend(Ember.Evented, {
  init() {
    this._super(...arguments);
    Ember.$(window).on(this.get('_storageSyncEvent'), this._onStorageSync.bind(this));
  },
  willDestroy() {
    this._super(...arguments);
    Ember.$(window).off(this.get('_storageSyncEvent'));
  },

  // Properties
  // ----------

  persistBetweenSessions: false, // on application load, set by `authService` according to user preferences

  // Methods
  // -------

  // Trigger a sync and return a promise to allow blocking until sync is complete. This Promise
  // will resolve in two ways: (1) the sync event takes too long and it times out or
  // (2) the storage updated event is triggered and we know that syncing has finished
  sync() {
    return new RSVP.Promise(resolve => {
      // set a key on localStorage (which spans tabs) to trigger other tabs to send their storage
      this._safeSet(window.localStorage, KEY_REQUEST_SEND_STORAGE_FOR_THIS_TAB, Date.now());
      // (1) The sync event times out and we cancel the event binding (finish scenario 2)
      const syncTimeoutTimer = run.later(() => {
        this.off(config.events.storage.updated, this);
        resolve();
      }, STORAGE_EVENT_SYNC_TIMEOUT_IN_MS);
      // (2) The sync finish event has been triggered and we cancel the timer (finish scenario 1)
      this.one(config.events.storage.updated, this, function() {
        run.cancel(syncTimeoutTimer);
        resolve();
      });
    });
  },
  isItemPersistent(key) {
    return isPresent(window.localStorage.getItem(key));
  },
  getItem(key) {
    return window.sessionStorage.getItem(key) || window.localStorage.getItem(key);
  },
  setItem(key, value) {
    this._safeSet(window.sessionStorage, key, value);
    if (this.get('persistBetweenSessions')) {
      this._safeSet(window.localStorage, key, value);
    }
  },
  removeItem(key) {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  },
  // Set the current state of this tab's sessionStorage on localStorage, which persists ACROSS tabs,
  // We set using the key to inform the eventual recipient of the event that this payload represents
  // the current state of the sessionStorage on this tab. Since we don't want to clutter localStorage,
  // we immediately remove the stringified sessionStorage -- this is fine because the event that
  // will be triggered will have a copy of the stringified sessionStorage in the event's data
  sendStorageToOtherTabs() {
    this._safeSet(
      window.localStorage, // spans across all tabs
      KEY_RECEIVE_REQUESTED_STORAGE_FROM_OTHER_TAB,
      JSON.stringify(window.sessionStorage) // this particular tab's state
    );
    window.localStorage.removeItem(KEY_RECEIVE_REQUESTED_STORAGE_FROM_OTHER_TAB);
  },

  // Internal
  // --------

  _storageSyncEvent: computed(function() {
    return `storage.${Ember.guidFor(this)}`;
  }),

  _safeSet(storageObj, key, value) {
    try {
      storageObj.setItem(key, value);
    } catch (e) {
      Ember.debug('storageService.trySet: web storage not available: ' + e);
    }
  },
  _onStorageSync({ originalEvent }) {
    if (originalEvent.key === KEY_REQUEST_SEND_STORAGE_FOR_THIS_TAB) {
      this.sendStorageToOtherTabs();
    } else if (
      originalEvent.key === KEY_RECEIVE_REQUESTED_STORAGE_FROM_OTHER_TAB &&
      originalEvent.storageArea === window.localStorage &&
      isPresent(originalEvent.newValue)
    ) {
      this._receiveStorageFromOtherTab(originalEvent.newValue);
    }
  },
  _receiveStorageFromOtherTab(data) {
    try {
      const dataObj = JSON.parse(data);
      if (typeOf(dataObj) === 'object') {
        window.sessionStorage.clear();
        for (let key in dataObj) {
          this._safeSet(window.sessionStorage, key, dataObj[key]);
        }
        this.trigger(config.events.storage.updated);
      }
    } catch (e) {
      Ember.debug('storageService._receiveStorageFromOtherTab: ' + e);
    }
  },
});
