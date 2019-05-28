import $ from 'jquery';
import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import Evented from '@ember/object/evented';
import LocaleUtils from 'textup-frontend/utils/locale';
import PropertyUtils from 'textup-frontend/utils/property';
import RSVP from 'rsvp';
import Service, { inject as service } from '@ember/service';
import StorageUtils from 'textup-frontend/utils/storage';
import TypeUtils from 'textup-frontend/utils/type';
import { computed } from '@ember/object';
import { debug } from '@ember/debug';
import { next } from '@ember/runloop';
import { typeOf, isPresent } from '@ember/utils';

export const LOG_IN_FAIL_MSG = 'Incorrect or blank username or password';

export default Service.extend(Evented, {
  notifications: service('notification-messages-service'),
  requestService: service(),
  router: service(),
  storageService: service(),
  store: service(),

  willDestroy() {
    this._super(...arguments);
    this.get('storageService').off(config.events.storage.updated, this);
  },

  // Properties
  // ----------

  token: null,
  refreshToken: null,
  authUser: null,
  isLoggedIn: computed('token', 'authUser', function() {
    return isPresent(this.get('token')) && isPresent(this.get('authUser'));
  }),
  authHeader: computed('token', function() {
    const token = this.get('token');
    return token ? `Bearer ${token}` : null;
  }),

  // Methods
  // -------

  trySetUpFromStorage() {
    // start listening for storage events from other tabs
    this.get('storageService').on(config.events.storage.updated, this, this._handleStorageChange);
    // validate stored token for staff, if any. This will reject if the staff is not logged in
    // so we always resolve because we want the app set-up to always proceed.
    return new RSVP.Promise(resolve =>
      this.get('storageService')
        .sync()
        .then(this._setUpFromStorage.bind(this))
        .catch(e => debug('authService.trySetUpFromStorage ' + e))
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
          $.ajax({
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
    this.get('router').transitionTo('index');
    // unload all after we finish the route transition and leave the logged-in route
    // so that cleanup doesn't happen while all the models are still displayed on the page
    next(() => this.get('store').unloadAll());
  },

  storeAuthResponseSuccess(responseObj, resolve = null) {
    if (typeOf(responseObj) === 'object') {
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
        PropertyUtils.callIfPresent(resolve, [staffObj])
      );
    }
  },

  // Internal
  // --------

  _attemptedTransition: null,

  _logInFail(reject) {
    this.get('notifications').error(LOG_IN_FAIL_MSG);
    PropertyUtils.callIfPresent(reject);
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
    const storedTokenVal = this.get('storageService').getItem(StorageUtils.authTokenKey());
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
      const storageService = this.get('storageService'),
        token = storageService.getItem(StorageUtils.authTokenKey()),
        refreshToken = storageService.getItem(StorageUtils.authRefreshTokenKey()),
        userId = storageService.getItem(StorageUtils.authUserIdKey());
      if (token && refreshToken && userId) {
        // set token so application adapter can help make our request
        // set refresh token so we can renew token if current is expired
        this.setProperties({ token, refreshToken });
        // set storage to also update localstorage only if current information is already persisted there
        storageService.set(
          'persistBetweenSessions',
          storageService.isItemPersistent(StorageUtils.authTokenKey())
        );
        // once all of the pertinent values in the authService are configured
        // then make the initial call to the backend to retrieve the staff
        this.get('store')
          .findRecord(Constants.MODEL.STAFF, userId)
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

  _storeAuthData(token, refreshToken, staff = null) {
    // storing appropriate items
    const storageService = this.get('storageService');
    storageService.setItem(StorageUtils.authTokenKey(), token);
    storageService.setItem(StorageUtils.authRefreshTokenKey(), refreshToken);
    this.setProperties({ token, refreshToken });
    // the only time that staff should be null is if we are setting
    // up and we are calling the server to retrieve the staff member
    // we then only set the token on auth success and don't set the authuser
    // or trigger any events
    if (TypeUtils.isStaff(staff)) {
      storageService.setItem(StorageUtils.authUserIdKey(), staff.get('id'));
      this.set('authUser', staff);
      // send storage event to notify other tabs only if the logged-in user has changed
      storageService.sendStorageToOtherTabs();
      this.trigger(config.events.auth.success);
    }
  },

  _clearAuthData(reject = null) {
    const storageService = this.get('storageService');
    storageService.removeItem(StorageUtils.authTokenKey());
    storageService.removeItem(StorageUtils.authRefreshTokenKey());
    storageService.removeItem(StorageUtils.authUserIdKey());
    storageService.sendStorageToOtherTabs();
    this.setProperties({ token: null, refreshToken: null, authUser: null });
    this.trigger(config.events.auth.clear);
    PropertyUtils.callIfPresent(reject);
  },
});
