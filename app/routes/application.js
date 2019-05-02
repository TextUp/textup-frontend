import Ember from 'ember';
import HasSlideoutOutlet from 'textup-frontend/mixins/route/has-slideout-outlet';
import Loading from 'textup-frontend/mixins/loading-slider';

const { isPresent } = Ember;

export default Ember.Route.extend(HasSlideoutOutlet, Loading, {
  authService: Ember.inject.service(),
  lockService: Ember.inject.service(),
  requestService: Ember.inject.service(),
  splashScreenService: Ember.inject.service(),
  stateService: Ember.inject.service(),

  beforeModel() {
    this._super(...arguments);
    return this.get('authService').trySetUpFromStorage();
  },
  // Use the redirect hook because it does not invalidate the work done thus far.
  // see: https://guides.emberjs.com/v2.4.0/routing/redirection/
  redirect(model, { targetName }) {
    this._super(...arguments);
    // initialize locking
    this.get('lockService').checkIfShouldStartLocked(targetName);
    // initialize location state
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
    },
    error(reason, transition) {
      this._super(...arguments);
      this.get('authService').storeAttemptedTransition(transition);
      this.get('requestService').handleResponseErrorObj(reason);
    },
  },
});
