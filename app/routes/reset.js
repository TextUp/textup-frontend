import Ember from 'ember';

export default Ember.Route.extend({
  // Events
  // ------

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
      const token = this.controller.get('token');
      return this.get('authService')
        .completeResetPassword(token, newPassword)
        .then(() => {
          this.notifications.success('Successfully reset your password!');
          this.transitionTo('login');
        }, this.get('dataService').buildErrorHandler());
    },
  },
});
