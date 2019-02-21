import Ember from 'ember';
import config from 'textup-frontend/config/environment';

export default Ember.Route.extend({
  storage: Ember.inject.service(),

  actions: {
    verifyLockCode(code) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        const un = this.get('authService.authUser.username');
        this.get('authService')
          .validateLockCode(un, code)
          .then(
            () => {
              this._resetAttempts();
              resolve();
            },
            () => {
              this.notifications.error('Incorrect lock code.');
              this._doAttempt();
              reject();
            }
          )
          .finally(() => this.controller.set('lockCode', ''));
      });
    },
  },

  // Lock Attempts properties + helpers
  // ----------------------------------
  _storageObj: Ember.computed('persistStorage', function() {
    return this.get('persistStorage') ? localStorage : sessionStorage;
  }),
  _numAttemptsKey: Ember.computed('storageNamespace', function() {
    return `${this.get('storageNamespace')}--attempts`;
  }),

  _doLogout() {
    this.get('authService').logout();
  },
  _doAttempt() {
    if (this.isDestroying || this.isDestroyed) {
      return;
    }
    this._incrementAttempts();
    if (this._isTooManyAttempts()) {
      this._resetAttempts();
      Ember.tryInvoke(this, '_doLogout');
    }
  },
  _isTooManyAttempts() {
    return this._getAttempts() > config.lock.maxNumAttempts;
  },
  _incrementAttempts() {
    const storage = this.get('storage'),
      obj = this.get('_storageObj'),
      key = this.get('_numAttemptsKey');
    storage.trySet(obj, key, this._getAttempts() + 1);
  },
  _resetAttempts() {
    const storage = this.get('storage'),
      obj = this.get('_storageObj'),
      key = this.get('_numAttemptsKey');
    storage.trySet(obj, key, 0);
  },
  _getAttempts() {
    const storage = this.get('storage'),
      key = this.get('_numAttemptsKey'),
      existing = parseInt(storage.getItem(key));
    return isNaN(existing) ? 0 : existing;
  },
});
