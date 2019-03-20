import callIfPresent from 'textup-frontend/utils/call-if-present';
import config from 'textup-frontend/config/environment';
import Ember from 'ember';
import HasSlideoutOutlet from 'textup-frontend/mixins/route/has-slideout-outlet';
import Loading from 'textup-frontend/mixins/loading-slider';

const {
  $,
  isArray,
  get,
  isPresent,
  run: { later, cancel },
} = Ember;

export default Ember.Route.extend(HasSlideoutOutlet, Loading, {
  attemptedTransition: null,
  storage: Ember.inject.service(),

  // Events
  // ------

  init() {
    this._super(...arguments);
    this.notifications.setDefaultClearNotification(5000);
    this.notifications.setDefaultAutoClear(true);
    this.get('authService')
      .on(config.events.auth.success, this, this._bindLockEvents)
      .on(config.events.auth.clear, this, this._clearLockEvents);
  },
  willDestroy() {
    this._super(...arguments);
    this.get('authService')
      .off(config.events.auth.success, this)
      .off(config.events.auth.clear, this);
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
    // skip initial locking when setting up controller if in ignore list
    const ignoreLock = config.state.ignoreLock,
      doInitialLock = ignoreLock.every(loc => targetName.indexOf(loc) === -1);
    this.set('doInitialLock', doInitialLock);
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
    if (this.get('authService.isLoggedIn') && this.get('doInitialLock')) {
      this.doLock();
    }
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

    updateLockCode(code) {
      this.controller.set('lockCode', code);
    },
    verifyLockCode(code) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        const un = this.get('authService.authUser.username');
        this.get('authService')
          .validateLockCode(un, code)
          .then(
            () => {
              this.doUnlock();
              resolve();
            },
            () => {
              this.notifications.error('Incorrect lock code.');
              reject();
            }
          )
          .finally(() => this.controller.set('lockCode', ''));
      });
    },

    // Slideout
    // --------

    willTransition(transition) {
      this._super(...arguments);
      const targetName = transition.targetName,
        url = this.get('storage').getItem('currentUrl'),
        ignoreLock = config.state.ignoreLock;
      if (this.controller.get('isLocked')) {
        const allowTransition = ignoreLock.any(loc => {
          return targetName.indexOf(loc) > -1;
        });
        if (allowTransition) {
          this.doUnlock();
        } else {
          transition.abort();
          // Manual fix for the problem of URL getting out of sync
          // when pressing the back button even though we are aborting
          // the transition.
          // http://stackoverflow.com/questions/17738923/
          //    url-gets-updated-when-using-transition-
          //    abort-on-using-browser-back
          if (window.history) {
            window.history.forward();
          }
        }
      } else if (this.get('authService.isLoggedIn')) {
        // otherwise, if logged in and we are coming from one of the ignoreLock
        // locations, then we need to re-lock
        const shouldRelock = ignoreLock.any(loc => {
          return url.indexOf(loc) > -1;
        });
        if (shouldRelock) {
          this.doLock();
        }
      }
    },
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

  // Lock helpers
  // ------------

  doLock() {
    if (!config.lock.lockOnHidden) {
      return;
    }
    this.controller.set('isLocked', true);
    Ember.run.scheduleOnce('afterRender', this, function() {
      $('#container .number-control').focus();
    });
  },
  doUnlock() {
    this.controller.set('isLocked', false);
  },
  _scheduleLock() {
    const org = this.get('authService.authUser.org.content'),
      changedAttrs = org.changedAttributes();
    let timeout = org.get('timeout');
    if (isArray(get(changedAttrs, 'timeout'))) {
      timeout = get(changedAttrs, 'timeout')[0];
    }
    timeout = isPresent(timeout) ? timeout : 15000;
    this.set('_lockTimer', later(this, this.doLock, timeout));
  },
  _unscheduleLock() {
    cancel(this.get('_lockTimer'));
  },
  _bindLockEvents() {
    this.get('visibility')
      .on(config.events.visibility.hidden, this, this._scheduleLock)
      .on(config.events.visibility.visible, this, this._unscheduleLock);
  },
  _clearLockEvents() {
    this.get('visibility')
      .off(config.events.visibility.hidden, this)
      .off(config.events.visibility.visible, this);
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
