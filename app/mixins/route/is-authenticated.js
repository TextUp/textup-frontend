import Ember from 'ember';
import Loading from 'textup-frontend/mixins/loading-slider';

export default Ember.Mixin.create(Loading, {
  beforeModel(transition) {
    this._super(...arguments);
    const authService = this.get('authService');
    if (!authService.get('isLoggedIn')) {
      authService.set('attemptedTransition', transition);
      this.notifications.info('Please log in first.');
      this.transitionTo('login');
    }
  },
});
