import LoadingSliderMixin from 'textup-frontend/mixins/loading-slider';
import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';

export default Mixin.create(LoadingSliderMixin, {
  authService: service(),

  beforeModel() {
    this._super(...arguments);
    if (this.get('authService.isLoggedIn')) {
      this.transitionTo('main', this.get('authService.authUser'));
    }
  },
});
