import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  notifications: service('notification-messages-service'),

  redirect(model, transition) {
    this._super(...arguments);
    const token = get(transition, 'queryParams.token');
    if (!token) {
      this.get('notifications').error('No authorization token specified.');
      this.transitionTo('login');
    }
  },
  resetController(controller) {
    this._super(...arguments);
    controller.setProperties({ newPassword: '', confirmNewPassword: '' });
  },
});
