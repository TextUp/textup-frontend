import Ember from 'ember';
import Loading from 'textup-frontend/mixins/loading-slider';

export default Ember.Mixin.create(Loading, {
  beforeModel() {
    this._super(...arguments);
    if (this.get('authService.isLoggedIn')) {
      this.transitionTo('main', this.get('authService.authUser'));
    }
  },
});
