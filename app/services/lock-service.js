import { readOnly } from '@ember/object/computed';
import { getOwner } from '@ember/application';
import Evented from '@ember/object/evented';
import Service, { inject as service } from '@ember/service';
import { run } from '@ember/runloop';
import RSVP from 'rsvp';
import { typeOf } from '@ember/utils';
import AppUtils from 'textup-frontend/utils/app';
import ArrayUtils from 'textup-frontend/utils/array';
import callIfPresent from 'textup-frontend/utils/call-if-present';
import config from 'textup-frontend/config/environment';
import IsPublicRouteMixin from 'textup-frontend/mixins/route/is-public';
import StorageUtils from 'textup-frontend/utils/storage';
import TypeUtils from 'textup-frontend/utils/type';

export default Service.extend(Evented, {
  authService: service(),
  notifications: service('notification-messages-service'),
  router: service(),
  storageService: service(),
  validateAuthService: service(),

  // Properties
  // ----------

  shouldStartLocked: true,
  lockContainer: null,
  lockCode: null,
  timeout: readOnly('authService.authUser.org.content.timeout'),
  authName: readOnly('authService.authUser.name'),
  isLocked: readOnly('lockContainer.isLocked'),

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

  scheduleCheckIfShouldStartLocked() {
    if (this.get('_isInitialRender')) {
      run.join(() => run.scheduleOnce('afterRender', this, this._checkIfShouldStartLocked));
    }
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

  _isInitialRender: true,

  _checkIfShouldStartLocked() {
    const lockContainer = this.get('lockContainer'),
      shouldStartLocked = this._shouldLockForRouteName(this.get('router.currentRouteName'));
    // If lock-container has not already initialized, then setting `shouldStartLocked` will cause
    // it to start unlocked
    this.setProperties({ shouldStartLocked, _isInitialRender: false });
    // if lock-container has already been initialized, then setting `shouldStartLocked` may not
    // have its intended effect. Instead, we will call the appropriate action on the registered
    // lockContainer object to ensure that our initialized state is what we want.
    if (lockContainer) {
      if (shouldStartLocked) {
        lockContainer.actions.lock();
      } else {
        lockContainer.actions.unlock();
      }
    }
  },

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
        const lookedUpRoute = getOwner(this).lookup(`route:${routeName}`);
        return IsPublicRouteMixin.detect(lookedUpRoute) ? false : true;
      }
    }
  },

  _onVerifySuccess(resolve) {
    this.trigger(config.events.lock.unlocked);
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
