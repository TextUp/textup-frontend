import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import config from 'textup-frontend/config/environment';
import HasEvents from 'textup-frontend/mixins/component/has-events';

const { computed, tryInvoke, run, $ } = Ember;

// message showed to user within native fingerprint dialogue
export const CLIENT_ID = 'Please verify your identity';
export const CLIENT_PASSWORD = 'password';

export default Ember.Component.extend(HasEvents, PropTypesMixin, {
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

  classNames: ['lock-container'],

  didInitAttrs() {
    this._super(...arguments);
    tryInvoke(this, 'doRegister', [this.get('_publicAPI')]);
  },

  didInsertElement() {
    if (config.hasCordova) {
      $(document).on(this._event('deviceready'), this._tryCordovaSetup.bind(this));
    } else {
      this.get('visibility')
        .on(config.events.visibility.hidden, this, this._updateLastActive)
        .on(config.events.visibility.visible, this, this._checkInactiveTime);
      this._tryLockOnInit();
    }
  },

  willDestroyElement() {
    $(document).off(this._event());
    this.get('visibility')
      .off(config.events.visibility.hidden, this, this._updateLastActive)
      .off(config.events.visibility.visible, this, this._checkInactiveTime);
  },

  // Internal properties
  // -------------------

  _cordovaReady: false,

  _publicAPI: computed(function() {
    return {
      isLocked: false,
      actions: {
        reset: this._doUnlock.bind(this),
      },
    };
  }),

  // Results
  // -------

  _doValidate() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      const retVal = tryInvoke(this, 'doValidate', [this.get('val')]);
      if (retVal && retVal.then) {
        retVal.then(() => {
          run(() => {
            this._doSuccess();
            resolve();
          });
        }, reject);
      } else {
        Ember.debug('error: doValidate did not return a promise');
      }
    });
  },

  _doSuccess() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    this._doUnlock();
  },

  _doFingerprint() {
    if (window.Fingerprint) {
      // if fingerprint available on device
      window.Fingerprint.isAvailable(() => {
        // bring up native prompt
        window.Fingerprint.show(
          {
            // values displayed in prompt
            clientId: CLIENT_ID,
            clientSecret: CLIENT_PASSWORD,
          },
          // success callback
          this._doSuccess.bind(this),
          // error callback
          err => Ember.debug('error:' + err)
        );
      });
    }
  },

  // Lock Helpers
  // ------------

  _tryCordovaSetup() {
    run(() => {
      $(document)
        .on(this._event('pause'), this._updateLastActive.bind(this))
        .on(this._event('resume'), this._checkInactiveTime.bind(this));
      this.set('_cordovaReady', true);
      this._tryLockOnInit();
    });
  },

  _tryLockOnInit() {
    if (this.get('lockOnInit') && !Ember.isNone(this.get('username'))) {
      this._doLock();
    }
  },

  _doLock() {
    // if lockOnHidden is false or no user is logged in do not lock
    if (!this.get('lockOnHidden') || Ember.isNone(this.get('username'))) {
      return;
    }
    this._updateIsLocked(true);

    // If mobile device and fingerprint avaiable use fingerprint authentication
    if (this.get('_cordovaReady')) {
      this._doFingerprint();
    }
  },

  _doUnlock() {
    this._updateIsLocked(false);
  },

  _updateIsLocked(status) {
    this.setProperties({
      _isLocked: status,
      '_publicAPI.isLocked': status,
    });
  },

  // Inactive Time Helpers
  // ---------------------

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
});
