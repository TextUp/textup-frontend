import Ember from 'ember';
import HasSlideoutOutlet from 'textup-frontend/mixins/route/has-slideout-outlet';
import Loading from 'textup-frontend/mixins/loading-slider';

const { isPresent } = Ember;

export default Ember.Route.extend(HasSlideoutOutlet, Loading, {
  authService: Ember.inject.service(),
  lockService: Ember.inject.service(),
  notifications: Ember.inject.service('notification-messages-service'),
  requestService: Ember.inject.service(),
  splashScreenService: Ember.inject.service(),
  stateService: Ember.inject.service(),

  init() {
    // For some reason, cannot set these defaults in an initializer so we need to set the default
    // notification settings here in this `init` hook
    const service = this.get('notifications');
    service.setDefaultClearDuration(5000);
    service.setDefaultAutoClear(true);
  },

  beforeModel() {
    this._super(...arguments);
    return this.get('authService').trySetUpFromStorage();
  },
  // Use the redirect hook because it does not invalidate the work done thus far.
  // see: https://guides.emberjs.com/v2.4.0/routing/redirection/
  redirect(model, { targetName }) {
    this._super(...arguments);
    // initialize location state based on the immediate location we are going to. This is so that
    // if we have typed in or pasted in a notification preview url we don't accidentally redirect
    // away from it.
    const url = this.get('stateService').startTrackingAndGetUrlToRestoreIfNeeded(targetName);
    if (isPresent(url)) {
      this.transitionTo(url);
    }
  },

  actions: {
    willTransition(transition) {
      this._super(...arguments);
      this.get('lockService').syncLockStatusWithTransition(transition);
    },
    didTransition() {
      this._super(...arguments); // call super for slideout
      this.get('splashScreenService').tryRemove();
      // Initialize locking after we have arrived on the final page that we are meant to be on
      // Checking AFTER the transition is complete ensures that, no matter what the URL we type in
      // and where the app ends up sending us, we will always initialize the lock status correctly.
      // For example, if we typed in the index route (which is public) and ended up on the main route
      // (which is private), then we would want to determine whether we should start locked on the
      // FINAL route not the initial route.
      // [NOTE] this method only works on the first call. Calling subsequent times will short circuit
      // The reason is that the `willTransition` hook is not called on the initial render so we
      // have to use the `didTransition` hook to see where we ended up on the initial render
      this.get('lockService').scheduleCheckIfShouldStartLocked();
    },
    error(reason, transition) {
      this._super(...arguments);
      this.get('authService').storeAttemptedTransition(transition);
      this.get('requestService').handleResponseErrorObj(reason);
    },
  },
});
