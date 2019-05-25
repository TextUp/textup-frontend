import $ from 'jquery';
import Component from '@ember/component';
import config from 'textup-frontend/config/environment';
import HasEvents from 'textup-frontend/mixins/component/has-events';
import PropertyUtils from 'textup-frontend/utils/property';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import RSVP from 'rsvp';
import { computed } from '@ember/object';
import { debug } from '@ember/debug';
import { inject as service } from '@ember/service';
import { isPresent, tryInvoke } from '@ember/utils';
import { run, join, scheduleOnce } from '@ember/runloop';

// REQUIRED, showed to user within native fingerprint dialogue
export const CLIENT_MESSAGE = 'Please verify your identity';
export const CLIENT_PASSWORD = 'password';

export default Component.extend(PropTypesMixin, HasEvents, {
  pageVisibilityService: service(),

  propTypes: Object.freeze({
    doRegister: PropTypes.func,
    onChange: PropTypes.func,
    onValidate: PropTypes.func,
    onCheckShouldLock: PropTypes.func,
    onLogOut: PropTypes.func,

    shouldStartLocked: PropTypes.bool,
    val: PropTypes.oneOfType([PropTypes.string, PropTypes.null]),
    username: PropTypes.oneOfType([PropTypes.string, PropTypes.null]),
    timeout: PropTypes.oneOfType([PropTypes.number, PropTypes.null]),
    disabled: PropTypes.bool,
  }),

  getDefaultProps() {
    return { shouldStartLocked: true, timeout: 15000, disabled: !config.lock.lockOnHidden };
  },

  classNames: 'lock-container',

  init() {
    this._super(...arguments);
    join(() =>
      scheduleOnce('afterRender', () => tryInvoke(this, 'doRegister', [this.get('_publicAPI')]))
    );
  },

  didInsertElement() {
    if (config.hasCordova) {
      $(document).on(this._event('deviceready'), this._tryCordovaSetup.bind(this));
    } else {
      this.get('pageVisibilityService')
        .on(config.events.visibility.hidden, this, this._updateLastActive)
        .on(config.events.visibility.visible, this, this._checkInactiveTime);
      scheduleOnce('afterRender', this, this._tryLockOnInit);
    }
  },

  willDestroyElement() {
    $(document).off(this._event());
    this.get('pageVisibilityService')
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
        tryValidate: this._onValidate.bind(this), // mostly for testing purposes
        lock: this._doLock.bind(this),
        unlock: this._doUnlock.bind(this),
      },
    };
  }),
  _canLock: computed('disabled', 'username', function() {
    // `username` is proxy for whether or not currently logged in
    return !this.get('disabled') && isPresent(this.get('username'));
  }),

  // Internal handlers
  // -----------------

  _tryCordovaSetup() {
    run(() => {
      $(document)
        .on(this._event('pause'), this._updateLastActive.bind(this))
        .on(this._event('resume'), this._checkInactiveTime.bind(this));
      this.set('_isCordovaReady', true);
      this._tryLockOnInit();
    });
  },
  _tryLockOnInit() {
    if (this.get('shouldStartLocked') && this.get('_canLock')) {
      this._doLock();
    }
  },

  _onChange() {
    tryInvoke(this, 'onChange', [...arguments]);
  },
  _onValidate() {
    return new RSVP.Promise((resolve, reject) => {
      if (this.get('isDestroying') || this.get('isDestroyed')) {
        reject();
      }
      PropertyUtils.ensurePromise(tryInvoke(this, 'onValidate', [this.get('val')])).then(() => {
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
  _onLogOut() {
    tryInvoke(this, 'onLogOut', [...arguments]);
  },

  _updateLastActive() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    this.set('_lastActive', Date.now());
  },
  _checkInactiveTime() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    const inactiveTime = Date.now() - this.get('_lastActive');
    if (inactiveTime >= this.get('timeout')) {
      // Will lock if (1) `onCheckShouldLock` is not provided or (2) resolves a Promise
      // Need to check because we may be on a page that should NOT lock on hidden
      PropertyUtils.ensurePromise(tryInvoke(this, 'onCheckShouldLock'))
        .then(this._doLock.bind(this))
        .catch(() => debug('lock-container._checkInactiveTime: do not lock even if timed out'));
    }
  },

  _doLock() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    if (this.get('_canLock')) {
      this._updateIsLocked(true);
      // If mobile device and fingerprint avaiable use fingerprint authentication
      if (this.get('_isCordovaReady')) {
        this._doFingerprint();
      }
    }
  },
  _doUnlock() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    this._updateIsLocked(false);
  },
  _updateIsLocked(status) {
    join(() => this.setProperties({ _isLocked: status, '_publicAPI.isLocked': status }));
  },
  _doFingerprint() {
    if (window.Fingerprint) {
      // if fingerprint available on device
      window.Fingerprint.isAvailable(() => {
        // bring up native prompt
        window.Fingerprint.show(
          { clientId: CLIENT_MESSAGE, clientSecret: CLIENT_PASSWORD },
          this._doSuccess.bind(this),
          err => debug('lock-container: ' + err)
        );
      });
    }
  },
});
