import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  queryParams: { filter: { refreshModel: true } },

  setupController(controller) {
    this._super(...arguments);
    controller.resetState();
  },
  resetController(controller) {
    this._super(...arguments);
    controller.resetState();
  },
});
