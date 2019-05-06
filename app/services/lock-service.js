import AppUtils from 'textup-frontend/utils/app';
import ArrayUtils from 'textup-frontend/utils/array';
import callIfPresent from 'textup-frontend/utils/call-if-present';
import config from 'textup-frontend/config/environment';
import Ember from 'ember';
import StorageUtils from 'textup-frontend/utils/storage';
import TypeUtils from 'textup-frontend/utils/type';

const { computed, RSVP, typeOf } = Ember;

export const VERIFY_FAIL_MESSAGE = 'Incorrect lock code.';

export default Ember.Service.extend({
  authService: Ember.inject.service(),
  notifications: Ember.inject.service(),
  storageService: Ember.inject.service(),
  validateAuthService: Ember.inject.service(),

  // Properties
  // ----------

  shouldStartLocked: true,
  lockContainer: null,
  lockCode: null,
  timeout: computed.readOnly('authService.authUser.org.content.timeout'),
  authName: computed.readOnly('authService.authUser.name'),
  isLocked: computed.readOnly('lockContainer.isLocked'),

  // Methods
  // -------

  verifyLockCode() {
    return new RSVP.Promise((resolve, reject) => {
      this.get('validateAuthService')
        .checkLockCode(this.get('authService.authUser.username'), this.get('lockCode'))
        .then(this._onVerifySuccess.bind(this, resolve), this._onVerifyFail.bind(this, reject))
        .finally(this._resetLockCode.bind(this));
    });
  },
  resetAndLogOut() {
    this.get('authService').logout();
    const lockContainer = this.get('lockContainer');
    if (lockContainer) {
      lockContainer.actions.unlock();
    }
  },

  checkIfShouldStartLocked(routeName) {
    this.set('shouldStartLocked', this._shouldLockForRouteName(routeName));
  },
  syncLockStatusWithTransition(transition) {
    if (!TypeUtils.isTransition(transition)) {
      return;
    }
    const lockContainer = this.get('lockContainer'),
      isCurrentlyLocked = this.get('isLocked'),
      willLockDestination = this._shouldLockForRouteName(transition.targetName);
    if (lockContainer) {
      if (isCurrentlyLocked && willLockDestination) {
        // (1) requires lock -> requires lock = forbid transition to prevent data loading
        AppUtils.abortTransition(transition);
      } else if (isCurrentlyLocked && !willLockDestination) {
        // (2) requires lock -> no lock = unlock
        lockContainer.actions.unlock();
      } else if (!isCurrentlyLocked && willLockDestination) {
        // (3) no lock -> requires lock = lock
        lockContainer.actions.lock();
      }
      // (4) no lock -> no lock = this service doesn't care about this, no locking is involved
    }
  },
  onCheckShouldLock(routeName) {
    return new RSVP.Promise((resolve, reject) => {
      if (this._shouldLockForRouteName(routeName)) {
        resolve();
      } else {
        reject();
      }
    });
  },

  // Internal
  // --------

  _shouldLockForRouteName(routeName) {
    return !!(
      typeOf(routeName) === 'string' &&
      !ArrayUtils.ensureArrayAndAllDefined(config.lock.ignoreLockRouteNames).any(loc =>
        routeName.includes(loc)
      )
    );
  },

  _onVerifySuccess(resolve) {
    this.get('notifications').clearAll();
    this._resetAttempts();
    callIfPresent(null, resolve);
  },
  _onVerifyFail(reject) {
    this.get('notifications').error(VERIFY_FAIL_MESSAGE);
    this._recordOneMoreAttempt();
    callIfPresent(null, reject);
  },
  _resetLockCode() {
    this.set('lockCode', '');
  },

  _recordOneMoreAttempt() {
    this._incrementAttempts();
    if (this._getAttempts() > config.lock.maxNumAttempts) {
      this._resetAttempts();
      this.resetAndLogOut();
    }
  },
  _incrementAttempts() {
    this.get('storageService').setItem(StorageUtils.numAttemptsKey(), this._getAttempts() + 1);
  },
  _resetAttempts() {
    this.get('storageService').setItem(StorageUtils.numAttemptsKey(), 0);
  },
  _getAttempts() {
    const numAttempts = parseInt(this.get('storageService').getItem(StorageUtils.numAttemptsKey()));
    return isNaN(numAttempts) ? 0 : numAttempts;
  },
});
