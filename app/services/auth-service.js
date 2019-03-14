import callIfPresent from 'textup-frontend/utils/call-if-present';
import config from '../config/environment';
import Ember from 'ember';
import LocaleUtils from 'textup-frontend/utils/locale';

const { computed, RSVP } = Ember;

export default Ember.Service.extend(Ember.Evented, {
  store: Ember.inject.service(),
  router: Ember.inject.service(),
  storage: Ember.inject.service(),
  notifications: Ember.inject.service(),

  token: null,
  refreshToken: null,
  authUser: null,
  attemptedTransition: null,

  // Computed properties
  // -------------------

  hasRefreshToken: computed.notEmpty('refreshToken'),
  hasToken: computed.notEmpty('token'),
  hasAuthUser: computed.notEmpty('authUser'),
  isLoggedIn: computed.and('hasToken', 'hasAuthUser'),

  timezone: computed(function() {
    return LocaleUtils.getTimezone();
  }),

  // Events
  // ------

  init() {
    this._super(...arguments);
    Ember.$.ajaxPrefilter(this._renewTokenOnError.bind(this));
  },
  willDestroy() {
    this._super(...arguments);
    this.get('storage').off(config.events.storage.updated, this);
  },

  // Methods
  // -------

  setupFromStorage() {
    return this.get('storage')
      .sync()
      .then(this._doSetup.bind(this));
  },
  validate(username, password) {
    return new RSVP.Promise((resolve, reject) => {
      if (!username || !password) {
        return reject();
      }
      this._sendCredentials('validate', {
        username: username,
        password: password,
      }).then(resolve, reject);
    });
  },
  validateLockCode(username, code) {
    return new RSVP.Promise((resolve, reject) => {
      if (!username || !code) {
        return reject();
      }
      this._sendCredentials('validate', {
        username: username,
        lockCode: code,
      }).then(resolve, reject);
    });
  },
  login(username, password, storeCredentials = false) {
    return new RSVP.Promise((resolve, reject) => {
      if (!username || !password) {
        return reject();
      }
      this._sendCredentials(`login?timezone=${this.get('timezone')}`, {
        username: username,
        password: password,
      }).then(data => {
        this.get('storage').set('persist', storeCredentials);
        const store = this.get('store'),
          staff = store.push(store.normalize('staff', data.staff));
        this._doAuthSuccess(data.access_token, data.refresh_token, staff);
        resolve(data);
      }, reject);
    });
  },
  logout() {
    this._doAuthClear();
    this.get('store').unloadAll();
    this.get('router').transitionTo('index');
  },
  resetPassword(username) {
    return new RSVP.Promise((resolve, reject) => {
      if (!username) {
        return reject();
      }
      Ember.$.ajax({
        type: 'POST',
        url: `${config.host}/reset`,
        contentType: 'application/json',
        data: JSON.stringify({
          username: username,
        }),
      }).then(resolve, reject);
    });
  },
  completeResetPassword(token, password) {
    return new RSVP.Promise((resolve, reject) => {
      if (!token || !password) {
        return reject();
      }
      Ember.$.ajax({
        type: 'PUT',
        url: `${config.host}/reset`,
        contentType: 'application/json',
        data: JSON.stringify({
          token,
          password,
        }),
      }).then(resolve, reject);
    });
  },
  retryAttemptedTransition(fallback) {
    const transition = this.get('attemptedTransition');
    if (transition) {
      this.set('attemptedTransition', null);
      try {
        transition.retry();
      } catch (err) {
        fallback();
      }
    } else {
      fallback();
    }
  },

  // Utility methods
  // ---------------

  authRequest(options = {}) {
    return new RSVP.Promise((resolve, reject) => {
      Ember.$.ajax(
        Ember.merge(
          {
            contentType: 'application/json',
            beforeSend: request => {
              if (this.get('hasToken')) {
                request.setRequestHeader('Authorization', `Bearer ${this.get('token')}`);
              }
            },
          },
          options
        )
      ).then(resolve, reject);
    });
  },

  // Helper methods
  // --------------

  _handleStorageChange() {
    const storage = this.get('storage');
    if (storage.getItem('token') === this.get('token')) {
      return;
    }
    const cachedIsLoggedIn = this.get('isLoggedIn');
    if (storage.getItem('token')) {
      this._doSetup().then(() => {
        if (!cachedIsLoggedIn) {
          this.get('router').transitionTo('main', this.get('authUser'));
        }
      }, this.logout.bind(this));
    } else {
      this.logout();
    }
  },
  _sendCredentials(endpoint, payload) {
    return Ember.$.ajax({
      type: 'POST',
      url: `${config.host}/${endpoint}`,
      contentType: 'application/json',
      data: JSON.stringify(payload),
    });
  },
  _doSetup() {
    return new RSVP.Promise((resolve, reject) => {
      const storage = this.get('storage'),
        token = storage.getItem('token'),
        refreshToken = storage.getItem('refreshToken'),
        userId = storage.getItem('userId'),
        onFail = function() {
          this._doAuthClear();
          reject();
        }.bind(this);
      if (token && userId && refreshToken) {
        // set token so application adapter can help make our request
        this.set('token', token);
        // set refresh token so we can renew token if current is expired
        this.set('refreshToken', refreshToken);
        // set storage to also update localstorage only if
        // current information is already persisted there
        storage.set('persist', storage.isItemPersistent('token'));
        // once all of the pertinent values in the authService are configured
        // then make the initial call to the backend to retrieve the staff
        this.get('store')
          .findRecord('staff', userId)
          .then(staff => {
            // we re-get the token and refresh token values because
            // over the course of the findRecord call, we may have updated
            // the token with an updated authToken. If we didn't update our value
            // for the token, then we will restore the outdated authToken
            this._doAuthSuccess(this.get('token'), this.get('refreshToken'), staff);
            storage.on(
              config.events.storage.updated,
              this,
              function() {
                this._handleStorageChange();
              }.bind(this)
            );
            resolve();
          }, onFail);
      } else {
        onFail();
      }
    });
  },
  _doAuthSuccess(token, refreshToken, staff = undefined) {
    // storing appropriate items
    const storage = this.get('storage');
    storage.setItem('token', token);
    storage.setItem('refreshToken', refreshToken);
    this.set('token', token);
    this.set('refreshToken', refreshToken);
    // the only time that staff should be undefined is if we are setting
    // up and we are calling the server to retrieve the staff member
    // we then only set the token on auth success and don't set the authuser
    // or trigger any events
    if (staff) {
      storage.setItem('userId', staff.get('id'));
      this.set('authUser', staff);
      // send storage event to notify other tabs, if necessary
      storage.sendStorage();
      // trigger this event after all work has been done
      this.trigger(config.events.auth.success);
    }
  },
  _doAuthClear() {
    // clear auth items
    const storage = this.get('storage');
    storage.removeItem('token');
    storage.removeItem('refreshToken');
    storage.removeItem('userId');
    storage.sendStorage();
    this.setProperties({
      token: null,
      refreshToken: null,
      authUser: null,
    });
    // trigger this event after all work has been done
    this.trigger(config.events.auth.clear);
  },

  // Refreshing token
  // ----------------

  _renewTokenOnError(options, originalOptions) {
    // Don't try to override error handler to try to renew token if
    // (1) we've already overriden handler
    // (2) no error handler is attached
    // (3) don't have an refresh token
    // (4) don't have an access token
    if (
      originalOptions._alreadyOverriden ||
      !originalOptions.error ||
      !this.get('hasRefreshToken') ||
      !this.get('hasToken')
    ) {
      return;
    }
    // NOTE: use traditional function syntax with bind so that arguments will work
    originalOptions._alreadyOverriden = true;
    originalOptions._onError = originalOptions.error;
    originalOptions._onBeforeSend = originalOptions.beforeSend;
    // override before send on original options so that our updated access token
    // will show up in subsequent request if it is renewed and the ajax
    // call is retried using the original options
    originalOptions.beforeSend = function(xhr) {
      callIfPresent(this, originalOptions._onBeforeSend, [...arguments]);
      xhr.setRequestHeader('Authorization', `Bearer ${this.get('token')}`);
    }.bind(this);
    // we override the error handler on options so that this current request
    // that is going out will exhibit the intercepted error behavior in the case
    // that this current ajax request being made results in a 401 error
    options.error = function(_jqXHR) {
      const errorArgs = arguments;
      if (_jqXHR.status === 401 && !originalOptions._alreadyTriedRenew) {
        originalOptions._alreadyTriedRenew = true;
        this._doRenewToken(() => {
          Ember.$.ajax(originalOptions);
        }, originalOptions._onError.bind(this, ...errorArgs));
      } else {
        originalOptions._onError(...errorArgs);
      }
    }.bind(this);
  },
  _doRenewToken(onSuccess, onError) {
    Ember.$.ajax({
      _alreadyOverriden: true, // short circuit _renewTokenOnError
      type: 'POST',
      url: `${config.host}/oauth/access_token`,
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
      data: {
        grant_type: 'refresh_token',
        refresh_token: this.get('refreshToken'),
      },
      // use traditional function syntax with bind so arguments will work
      success: data => {
        const store = this.get('store'),
          staff = store.peekRecord('staff', data.staff.id);
        // staff may be null if it hasn't been loaded yet
        this._doAuthSuccess(data.access_token, data.refresh_token, staff);
        callIfPresent(this, onSuccess, [...arguments]);
      },
      error: onError,
    });
  },
});
