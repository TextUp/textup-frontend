import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  authService: service(),
  userSetupService: service(),

  actions: {
    finishPersonalNumberSetup() {
      this.get('userSetupService')
        .finishPersonalNumberSetup()
        .then(setupUser => this.transitionToRoute('main', setupUser));
    },
    skipSetup() {
      this.get('userSetupService').skipSetup();
      this.transitionToRoute('main', this.get('authService.authUser'));
    },
  },
});
