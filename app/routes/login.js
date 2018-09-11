import Ember from 'ember';
import IsPublic from 'textup-frontend/mixins/route/is-public';

export default Ember.Route.extend(IsPublic, {
  deactivate: function() {
    this._super(...arguments);
    this.controller.setProperties({
      username: null,
      password: null,
      resetUsername: null
    });
  },
  actions: {
    login: function(un, pwd, doStore) {
      const auth = this.get('authService');
      return auth.login(un, pwd, doStore).then(
        () => {
          auth.retryAttemptedTransition(() => {
            this.transitionTo('main', auth.get('authUser'));
          });
        },
        () => {
          this.notifications.error('Incorrect or blank username or password');
        }
      );
    },
    resetPassword: function(un) {
      return this.get('authService')
        .resetPassword(un)
        .then(
          () => {
            this.notifications.success(`All good! The password reset
          should be in your inbox in a few minutes.`);
          },
          () => {
            this.notifications.error(`Hmm. We could not find the username
          you provided. Please try again.`);
          }
        );
    }
  }
});
