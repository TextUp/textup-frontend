import Ember from 'ember';

const { isPresent } = Ember;

export default Ember.Mixin.create({
  authService: Ember.inject.service(),
  userSetupService: Ember.inject.service(),

  // This needs to run AFTER the `beforeModel` and `afterModel` hooks decide what the appropriate
  // location for the current user is.
  setupController() {
    this._super(...arguments);
    if (
      !this.get('userSetupService').hasSkippedSetup() &&
      !isPresent(this.get('authService.authUser.personalNumber')) // empty string is NOT present
    ) {
      this.transitionTo('setup');
    }
  },
});
