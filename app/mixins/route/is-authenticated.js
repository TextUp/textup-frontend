import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import Loading from 'textup-frontend/mixins/loading-slider';

export default Mixin.create(Loading, {
  authService: service(),
  notifications: service('notification-messages-service'),

  beforeModel(transition) {
    this._super(...arguments);
    const authService = this.get('authService');
    if (!authService.get('isLoggedIn')) {
      authService.storeAttemptedTransition(transition);
      this.get('notifications').info('Please log in first.');
      this.transitionTo('login');
    }
  },
});
