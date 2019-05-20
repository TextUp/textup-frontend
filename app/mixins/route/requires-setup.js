import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import { isPresent } from '@ember/utils';

export default Mixin.create({
  authService: service(),
  userSetupService: service(),

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
