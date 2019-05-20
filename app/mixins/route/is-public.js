import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import Loading from 'textup-frontend/mixins/loading-slider';

export default Mixin.create(Loading, {
  authService: service(),

  beforeModel() {
    this._super(...arguments);
    if (this.get('authService.isLoggedIn')) {
      this.transitionTo('main', this.get('authService.authUser'));
    }
  },
});
