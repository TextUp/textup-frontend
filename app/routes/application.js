import callIfPresent from 'textup-frontend/utils/call-if-present';
import config from 'textup-frontend/config/environment';
import Ember from 'ember';
import HasSlideoutOutlet from 'textup-frontend/mixins/route/has-slideout-outlet';
import Loading from 'textup-frontend/mixins/loading-slider';

const { isArray, get } = Ember;

export default Ember.Route.extend(HasSlideoutOutlet, Loading, {
  storage: Ember.inject.service(),

  // Events
  // ------

  init() {
    this._super(...arguments);
    this.get('notifications').setDefaultClearNotification(5000);
    this.get('notifications').setDefaultAutoClear(true);
  },

  // Hooks
  // -----

  beforeModel() {
    // validate stored token for staff, if any
    // return promise so that resolver blocks until promise completes
    // catch any error to avoid default error handler if promise
    // rejects when the staff is not logged in
    return this.get('authService')
      .setupFromStorage()
      .catch(() => {});
  },
  redirect(model, transition) {
    const storage = this.get('storage'),
      url = storage.getItem('currentUrl'),
      targetName = transition.targetName;
    // initialize the observer after retrieving the previous currentUrl
    this.get('stateManager').trackLocation();

    // redirect only if previous url present and the target
    // route is not one of the routes to be ignored
    const ignoreTracking = config.state.ignoreTracking,
      doTracking = ignoreTracking.every(loc => targetName.indexOf(loc) === -1);
    if (doTracking && url) {
      this.transitionTo(url);
    }
  },
  setupController(controller) {
    this._super(...arguments);
    controller.set('lockCode', '');
  },

  actions: {
    validate(un, pwd, then = undefined) {
      return this.get('dataService')
        .request(this.get('authService').validate(un, pwd))
        .then(() => callIfPresent(this, then));
    },
    logout() {
      this.get('authService').logout();
    },

    // Lock
    // ----

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
              this.get('notifications').error('Incorrect lock code.');
              this._doAttempt();
              reject();
            }
          )
          .finally(() => this.controller.set('lockCode', ''));
      });
    },

    // Slideout
    // --------

    didTransition() {
      this._super(...arguments);
      // initializer
      if (!this.get('_initialized')) {
        Ember.run.next(this, function() {
          const $initializer = Ember.$('#initializer');
          $initializer.fadeOut('fast', () => {
            $initializer.remove();
            this.set('_initialized', true);
          });
        });
      }
      // lock screen
      this.controller.set('lockCode', '');
    },

    // Slideout utilities
    // ------------------

    clearList(models, propName, ...then) {
      this._doForOneOrMany(models, model => model.get(propName).clear());
      then.forEach(fn => callIfPresent(this, fn));
    },
    revert(models, ...then) {
      this._doForOneOrMany(models, model => model && model.rollbackAttributes());
      then.forEach(fn => callIfPresent(this, fn));
    },
    revertAttribute(models, attributeName, ...then) {
      this._doForOneOrMany(models, model => {
        if (model) {
          const changes = get(model.changedAttributes(), attributeName);
          if (isArray(changes)) {
            model.set(attributeName, changes[0]);
          }
        }
      });
      then.forEach(fn => callIfPresent(this, fn));
    },
    persist(models, ...then) {
      return this.get('dataService')
        .persist(models)
        .then(() => then.forEach(fn => callIfPresent(this, fn)));
    },
    markForDelete(models, ...then) {
      this.get('dataService').markForDelete(models);
      then.forEach(fn => callIfPresent(this, fn));
    },

    // Chaining utilities
    // ------------------

    mutate(propClosure, newValue, ...then) {
      callIfPresent(this, propClosure, [newValue]);
      then.forEach(fn => callIfPresent(this, fn));
    },

    // Errors
    // ------

    error(reason, transition) {
      this.get('authService').set('attemptedTransition', transition);
      this.get('dataService').handleError(reason);
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
    // logout
    this.get('authService').logout();
    // unlock
    const lockContainer = this.get('controller.lockContainer');
    if (lockContainer) {
      lockContainer.actions.reset();
    }
  },
  _doAttempt() {
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

  // Helpers
  // -------

  _doForOneOrMany(data, doAction) {
    if (Ember.isArray(data)) {
      return data.forEach(doAction);
    } else {
      return doAction(data);
    }
  },
});
