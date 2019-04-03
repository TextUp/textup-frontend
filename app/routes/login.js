import Ember from 'ember';
import IsPublic from 'textup-frontend/mixins/route/is-public';

export default Ember.Route.extend(IsPublic, {
  deactivate() {
    this._super(...arguments);
    this.controller.setProperties({
      username: null,
      password: null,
      resetUsername: null,
    });
  },
  actions: {
    login(un, pwd, doStore) {
      const authService = this.get('authService');
      return authService.login(un, pwd, doStore).then(
        () => {
          authService.retryAttemptedTransition(() => {
            // need to get the authUser after it has been set by the login function
            this.transitionTo('main', authService.get('authUser'));
          });
        },
        () => this.notifications.error('Incorrect or blank username or password')
      );
    },
    resetPassword(un) {
      const successMsg = `All good! The password reset should be in your inbox in a few minutes.`,
        failMsg = `Hmm. We could not find the username you provided. Please try again.`;
      return this.get('authService')
        .resetPassword(un)
        .then(
          () => this.notifications.success(successMsg),
          () => this.notifications.error(failMsg)
        );
    },
  },
});
