import callIfPresent from 'textup-frontend/utils/call-if-present';
import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import LocaleUtils from 'textup-frontend/utils/locale';

const { computed, RSVP } = Ember;

export const LOG_IN_FAIL_MSG = 'Incorrect or blank username or password';

export default Ember.Service.extend(Ember.Evented, {
  notifications: Ember.inject.service(),
  requestService: Ember.inject.service(),
  router: Ember.inject.service(),
  storageService: Ember.inject.service(),
  store: Ember.inject.service(),

  init() {
    this._super(...arguments);
    this.get('storageService').on(config.events.storage.updated, this, this._handleStorageChange);
  },
  willDestroy() {
    this._super(...arguments);
    this.get('storageService').off(config.events.storage.updated, this);
  },

  // Properties
  // ----------

  token: null,
  refreshToken: null,
  authUser: null,
  isLoggedIn: computed.and('token', 'authUser'),
  authHeader: computed('token', function() {
    return `Bearer ${this.get('token')}`;
  }),

  // Methods
  // -------

  trySetUpFromStorage() {
    // validate stored token for staff, if any. This will reject if the staff is not logged in
    // so we always resolve because we want the app set-up to always proceed.
    return new RSVP.Promise(resolve =>
      this.get('storageService')
        .sync()
        .then(this._setUpFromStorage.bind(this))
        .finally(resolve)
    );
  },

  storeAttemptedTransition(transiiton) {
    this.set('_attemptedTransition', transiiton);
  },

  login(username, password, storeInPersistentStorage = false) {
    return new RSVP.Promise((resolve, reject) => {
      if (!username || !password) {
        return reject();
      }
      this.get('requestService')
        .handleIfError(
          Ember.$.ajax({
            type: Constants.REQUEST_METHOD.POST,
            url: `${config.host}/login?timezone=${LocaleUtils.getTimezone()}`,
            contentType: Constants.MIME_TYPE.JSON,
            data: JSON.stringify({ username, password }),
          })
        )
        .then(responseObj => {
          this.get('storageService').set('persistBetweenSessions', storeInPersistentStorage);
          this.storeAuthResponseSuccess(responseObj, resolve);
        }, this._logInFail.bind(this, reject));
    });
  },
  logout() {
    this._clearAuthData();
    this.get('store').unloadAll();
    this.get('router').transitionTo('index');
  },

  storeAuthResponseSuccess(responseObj, resolve = null) {
    const store = this.get('store'),
      staffObj = store.push(
        store.normalize(Constants.MODEL.STAFF, responseObj[Constants.MODEL.STAFF])
      );
    this._storeAuthData(
      responseObj[Constants.RESPONSE_KEY.ACCESS_TOKEN],
      responseObj[Constants.RESPONSE_KEY.REFRESH_TOKEN],
      staffObj
    );
    this._retryAttemptedTransitionAfterLogIn().finally(() =>
      callIfPresent(null, resolve, [staffObj])
    );
  },

  // Internal
  // --------

  _attemptedTransition: null,

  _logInFail(reject) {
    this.get('notifications').error(LOG_IN_FAIL_MSG);
    callIfPresent(null, reject);
  },
  _retryAttemptedTransitionAfterLogIn() {
    return new RSVP.Promise(resolve => {
      try {
        const transition = this.get('_attemptedTransition');
        if (transition) {
          transition.retry();
        }
      } finally {
        this.set('_attemptedTransition', null);
        resolve();
      }
    });
  },

  _handleStorageChange() {
    const storedTokenVal = this.get('storageService').getItem('token');
    // short circuit if nothing really has changed
    if (storedTokenVal === this.get('token')) {
      return;
    }
    // if token has changed...
    if (storedTokenVal) {
      const isLoggedInBeforeSetUp = this.get('isLoggedIn');
      this._setUpFromStorage().then(
        this._storageChangeSetUpSuccess.bind(this, isLoggedInBeforeSetUp),
        this.logout.bind(this)
      );
    } else {
      this.logout();
    }
  },
  _storageChangeSetUpSuccess(loggedInBeforeStorageChange) {
    if (!loggedInBeforeStorageChange) {
      this.get('router').transitionTo('main', this.get('authUser'));
    }
  },

  _setUpFromStorage() {
    return new RSVP.Promise((resolve, reject) => {
      const storage = this.get('storageService'),
        token = storage.getItem('token'),
        refreshToken = storage.getItem('refreshToken'),
        userId = storage.getItem('userId');
      if (token && refreshToken && userId) {
        // set token so application adapter can help make our request
        // set refresh token so we can renew token if current is expired
        this.setProperties({ token, refreshToken });
        // set storage to also update localstorage only if current information is already persisted there
        storage.set('persistBetweenSessions', storage.isItemPersistent('token'));
        // once all of the pertinent values in the authService are configured
        // then make the initial call to the backend to retrieve the staff
        this.get('store')
          .findRecord('staff', userId)
          .then(staff => {
            // we re-fetch the token and refresh token values because
            // over the course of the findRecord call, we may have updated
            // the token with an updated authToken. If we didn't update our value
            // for the token, then we will restore the outdated authToken
            this._storeAuthData(this.get('token'), this.get('refreshToken'), staff);
            resolve();
          }, this._clearAuthData.bind(this, reject));
      } else {
        this._clearAuthData(reject);
      }
    });
  },

  _storeAuthData(token, refreshToken, staff = undefined) {
    // storing appropriate items
    const storage = this.get('storageService');
    storage.setItem('token', token);
    storage.setItem('refreshToken', refreshToken);
    this.setProperties({ token, refreshToken });
    // the only time that staff should be undefined is if we are setting
    // up and we are calling the server to retrieve the staff member
    // we then only set the token on auth success and don't set the authuser
    // or trigger any events
    if (staff) {
      storage.setItem('userId', staff.get('id'));
      this.set('authUser', staff);
      // send storage event to notify other tabs, if necessary
      storage.sendStorageToOtherTabs();
      this.trigger(config.events.auth.success);
    }
  },

  _clearAuthData(reject = null) {
    const storage = this.get('storageService');
    storage.removeItem('token');
    storage.removeItem('refreshToken');
    storage.removeItem('userId');
    storage.sendStorageToOtherTabs();
    this.setProperties({ token: null, refreshToken: null, authUser: null });
    this.trigger(config.events.auth.clear);
    callIfPresent(null, reject);
  },
});
