import LoadingSliderMixin from 'textup-frontend/mixins/loading-slider';
import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';

export default Mixin.create(LoadingSliderMixin, {
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
