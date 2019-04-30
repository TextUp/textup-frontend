import config from 'textup-frontend/config/environment';
import Ember from 'ember';
import HasEvents from 'textup-frontend/mixins/component/has-events';
import PropertyUtils from 'textup-frontend/utils/property';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { computed, tryInvoke, run, isNone } = Ember;

// message showed to user within native fingerprint dialogue
export const CLIENT_ID = 'Please verify your identity';
export const CLIENT_PASSWORD = 'password';

export default Ember.Component.extend(PropTypesMixin, HasEvents, {
  visibility: Ember.inject.service(),

  propTypes: {
    doRegister: PropTypes.func,
    val: PropTypes.oneOfType([PropTypes.string, PropTypes.null]),
    doUpdateVal: PropTypes.func.isRequired,
    doValidate: PropTypes.func.isRequired,
    username: PropTypes.oneOfType([PropTypes.string, PropTypes.null]),

    lockOnHidden: PropTypes.bool,
    lockOnInit: PropTypes.bool,
    timeout: PropTypes.number,
  },

  getDefaultProps() {
    return {
      lockOnHidden: config.lock.lockOnHidden,
      lockOnInit: true,
      isMaxAttempt: true,
      timeout: 15000,
    };
  },

  classNames: 'lock-container',

  didInitAttrs() {
    this._super(...arguments);
    tryInvoke(this, 'doRegister', [this.get('_publicAPI')]);
  },

  didInsertElement() {
    if (config.hasCordova) {
      Ember.$(document).on(this._event('deviceready'), this._tryCordovaSetup.bind(this));
    } else {
      this.get('visibility')
        .on(config.events.visibility.hidden, this, this._updateLastActive)
        .on(config.events.visibility.visible, this, this._checkInactiveTime);
      run.scheduleOnce('afterRender', this, this._tryLockOnInit);
    }
  },

  willDestroyElement() {
    Ember.$(document).off(this._event());
    this.get('visibility')
      .off(config.events.visibility.hidden, this, this._updateLastActive)
      .off(config.events.visibility.visible, this, this._checkInactiveTime);
  },

  // Internal properties
  // -------------------

  _lastActive: null,
  _isCordovaReady: false,
  _isLocked: false,
  _publicAPI: computed(function() {
    return {
      isLocked: false,
      actions: {
        reset: this._doUnlock.bind(this),
      },
    };
  }),

  // Internal handlers
  // -----------------

  _tryCordovaSetup() {
    run(() => {
      Ember.$(document)
        .on(this._event('pause'), this._updateLastActive.bind(this))
        .on(this._event('resume'), this._checkInactiveTime.bind(this));
      this.set('_isCordovaReady', true);
      this._tryLockOnInit();
    });
  },
  _tryLockOnInit() {
    if (this.get('lockOnInit') && !isNone(this.get('username'))) {
      this._doLock();
    }
  },

  _doFingerprint() {
    if (window.Fingerprint) {
      // if fingerprint available on device
      window.Fingerprint.isAvailable(() => {
        // bring up native prompt
        window.Fingerprint.show(
          { clientId: CLIENT_ID, clientSecret: CLIENT_PASSWORD },
          this._doSuccess.bind(this),
          err => Ember.debug('lock-container:' + err)
        );
      });
    }
  },
  _doValidate() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      PropertyUtils.ensurePromise(tryInvoke(this, 'doValidate', [this.get('val')])).then(() => {
        this._doSuccess();
        resolve();
      }, reject);
    });
  },
  _doSuccess() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    this._doUnlock();
  },

  _updateLastActive() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    this.set('_lastActive', Date.now());
  },
  _checkInactiveTime() {
    const inactiveTime = Date.now() - this.get('_lastActive');
    if (inactiveTime >= this.get('timeout')) {
      this._doLock();
    }
  },

  _doLock() {
    // if lockOnHidden is false or no user is logged in do not lock
    if (!this.get('lockOnHidden') || isNone(this.get('username'))) {
      return;
    }
    this._updateIsLocked(true);

    // If mobile device and fingerprint avaiable use fingerprint authentication
    if (this.get('_isCordovaReady')) {
      this._doFingerprint();
    }
  },
  _doUnlock() {
    this._updateIsLocked(false);
  },
  _updateIsLocked(status) {
    run.join(() => this.setProperties({ _isLocked: status, '_publicAPI.isLocked': status }));
  },
});
