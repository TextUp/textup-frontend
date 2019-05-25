import IsAuthenticated from 'textup-frontend/mixins/route/is-authenticated';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';

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
});
