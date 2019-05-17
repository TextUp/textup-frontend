import Ember from 'ember';
import Loading from 'textup-frontend/mixins/loading-slider';

export default Ember.Mixin.create(Loading, {
  authService: Ember.inject.service(),
  notifications: Ember.inject.service('notification-messages-service'),

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
