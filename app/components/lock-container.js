import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import config from 'textup-frontend/config/environment';

const { tryInvoke, run } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  visibility: Ember.inject.service(),

  propTypes: {
    val: PropTypes.oneOfType([PropTypes.string, PropTypes.null]),
    doUpdateVal: PropTypes.func.isRequired,
    doValidate: PropTypes.func.isRequired,

    lockOnHidden: PropTypes.bool,
    lockOnInit: PropTypes.bool,
    timeout: PropTypes.number,
    username: PropTypes.oneOfType([PropTypes.string, PropTypes.null]),
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

  didReceiveAttrs() {
    if (Ember.isNone(this.get('username'))) {
      this._clearLockEvents();
    } else {
      this._bindLockEvents();
    }
  },

  init() {
    this._super(...arguments);
    if (!Ember.isNone(this.get('username')) && this.get('lockOnInit')) {
      this._doLock();
    }
  },

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
        console.log('doValidate did not return a promise');
      }
    });
  },

  _doSuccess() {
    if (this.isDestroying || this.isDestroyed) {
      return;
    }
    this._doUnlock();
  },

  // Lock Helpers
  // ------------

  _doLock() {
    if (!this.get('lockOnHidden')) {
      return;
    }
    this.set('_isLocked', true);
  },

  _doUnlock() {
    this.set('_isLocked', false);
  },

  // Bind Lock Events
  // ----------------

  _bindLockEvents() {
    this.get('visibility')
      .on(config.events.visibility.hidden, this, this._updateLastActive)
      .on(config.events.visibility.visible, this, this._checkInactiveTime);
  },
  _clearLockEvents() {
    this.get('visibility')
      .off(config.events.visibility.hidden, this)
      .off(config.events.visibility.visible, this);
  },

  // Inactive Time Helpers
  // ---------------------

  _updateLastActive() {
    if (this.isDestroying || this.isDestroyed) {
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
