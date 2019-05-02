import Ember from 'ember';

export default Ember.Route.extend({
  passwordResetService: Ember.inject.service(),

  redirect(model, transition) {
    const token = Ember.get(transition, 'queryParams.token');
    if (!token) {
      this.notifications.error('No authorization token specified.');
      this.transitionTo('login');
    }
  },
  deactivate() {
    this.controller.set('newPassword', '');
    this.controller.set('confirmNewPassword', '');
  },

  // Actions
  // -------

  actions: {
    completeReset(newPassword) {
      return this.get('passwordResetService')
        .updatePasswordWithToken(this.controller.get('token'), newPassword)
        .then(() => this.transitionTo('login'));
    },
  },
});
