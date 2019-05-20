import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { isPresent } from '@ember/utils';
import IsAuthenticated from 'textup-frontend/mixins/route/is-authenticated';

export default Route.extend(IsAuthenticated, {
  authService: service(),
  userSetupService: service(),

  redirect() {
    this._super(...arguments);
    const authUser = this.get('authService.authUser');
    if (isPresent(authUser.get('personalNumber'))) {
      this.transitionTo('main', authUser);
    }
  },
  activate() {
    this._super(...arguments);
    this.get('userSetupService').tryRestorePreviousState();
  },
  actions: {
    finishPersonalNumberSetup() {
      this.get('userSetupService')
        .finishPersonalNumberSetup()
        .then(setupUser => this.transitionTo('main', setupUser));
    },
    skipSetup() {
      this.get('userSetupService').skipSetup();
      this.transitionTo('main', this.get('authService.authUser'));
    },
  },
});
