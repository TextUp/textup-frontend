import Constants from 'textup-frontend/constants';
import MainTagDetailsRoute from 'textup-frontend/routes/main/tag/details';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default MainTagDetailsRoute.extend({
  authService: service(),

  backRouteName: 'main.contacts',
  backRouteLinkParams: computed(
    `authService.authUser.${Constants.PROP_NAME.URL_IDENT}`,
    function() {
      return [this.get(`authService.authUser.${Constants.PROP_NAME.URL_IDENT}`)];
    }
  ),

  model({ id }) {
    if (id) {
      const found = this.get('store').peekRecord('contact', id);
      return found
        ? found
        : this.get('store')
            .findRecord('contact', id)
            .catch(() =>
              this.transitionTo(this.get('backRouteName'), ...this.get('backRouteLinkParams'))
            );
    } else {
      this.transitionTo(this.get('backRouteName'), ...this.get('backRouteLinkParams'));
    }
  },
  setupController(controller) {
    this._super(...arguments);
    controller.set('backRouteName', this.get('backRouteName'));
    controller.set('backRouteLinkParams', this.get('backRouteLinkParams'));
    controller.tryStartObserveContactStatus();
  },
  resetController(controller, isExiting) {
    this._super(...arguments);
    if (isExiting) {
      controller.stopObserveContactStatus();
    }
  },
});
