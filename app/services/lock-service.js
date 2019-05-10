import AppUtils from 'textup-frontend/utils/app';
import ArrayUtils from 'textup-frontend/utils/array';
import callIfPresent from 'textup-frontend/utils/call-if-present';
import config from 'textup-frontend/config/environment';
import Ember from 'ember';
import IsPublicRouteMixin from 'textup-frontend/mixins/route/is-public';
import StorageUtils from 'textup-frontend/utils/storage';
import TypeUtils from 'textup-frontend/utils/type';

const { computed, RSVP, typeOf } = Ember;

export default Ember.Service.extend({
  authService: Ember.inject.service(),
  notifications: Ember.inject.service(),
  router: Ember.inject.service(),
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
    // [NOTE] do not need to unlock the lock container here. The `syncLockStatusWithTransition`
    // will ensure the appropriate lock status
    this.get('authService').logout();
  },

  checkIfShouldStartLocked(routeName) {
    this.set('shouldStartLocked', this._shouldLockForRouteName(routeName));
  },
  syncLockStatusWithTransition(transition) {
    if (!TypeUtils.isTransition(transition)) {
      return;
    }
    // Determining whether or not we should lock on timeout is the job of `lock-container`
    // This function manages lock/unlock when moving to and from pages that should be locked
    // and those that don't require a lock. If we are unlocked on a page that requires locking
    // and moving to another page that requires locking we DO NOT want to lock because this would
    // for the user to type in their lock code for every single page transition.
    const lockContainer = this.get('lockContainer'),
      isCurrentlyLocked = this.get('isLocked'),
      canLockOnCurrentPage = this._shouldLockForRouteName(this.get('router.currentRouteName')),
      willLockDestination = this._shouldLockForRouteName(transition.targetName);
    if (lockContainer) {
      if (isCurrentlyLocked && canLockOnCurrentPage && willLockDestination) {
        // (1) requires lock -> requires lock AND is currently locked =
        //     forbid transition to prevent data loading
        AppUtils.abortTransition(transition);
      } else if (canLockOnCurrentPage && !willLockDestination) {
        // (2) requires lock -> no lock = unlock
        lockContainer.actions.unlock();
      } else if (!canLockOnCurrentPage && willLockDestination) {
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
    if (typeOf(routeName) !== 'string') {
      return true;
    } else {
      const shouldIgnoreLock = ArrayUtils.ensureArrayAndAllDefined(
        config.lock.ignoreLockRouteNames
      ).any(loc => routeName.includes(loc));
      if (shouldIgnoreLock) {
        return false;
      } else {
        const lookedUpRoute = Ember.getOwner(this).lookup(`route:${routeName}`);
        return IsPublicRouteMixin.detect(lookedUpRoute) ? false : true;
      }
    }
  },

  _onVerifySuccess(resolve) {
    this.get('notifications').clearAll();
    this._resetAttempts();
    callIfPresent(null, resolve);
  },
  _onVerifyFail(reject) {
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
    this.get('storageService').removeItem(StorageUtils.numAttemptsKey());
  },
  _getAttempts() {
    const numAttempts = parseInt(this.get('storageService').getItem(StorageUtils.numAttemptsKey()));
    return isNaN(numAttempts) ? 0 : numAttempts;
  },
});
