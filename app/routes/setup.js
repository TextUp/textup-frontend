import Ember from 'ember';
import IsAuthenticated from 'textup-frontend/mixins/route/is-authenticated';

const { isPresent } = Ember;

export default Ember.Route.extend(IsAuthenticated, {
  authService: Ember.inject.service(),
  userSetupService: Ember.inject.service(),

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
