import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  notifications: service('notification-messages-service'),
  passwordResetService: service(),

  redirect(model, transition) {
    const token = get(transition, 'queryParams.token');
    if (!token) {
      this.get('notifications').error('No authorization token specified.');
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
