import AppUtils from 'textup-frontend/utils/app';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  adminService: service(),

  backRouteParams: Object.freeze(['admin.people']),

  model({ id }) {
    if (id) {
      const found = this.get('store').peekRecord('staff', id);
      return found
        ? found
        : this.get('store')
            .findRecord('staff', id)
            .catch(() => this.transitionTo(...this.get('backRouteParams')));
    } else {
      this.transitionTo(...this.get('backRouteParams'));
    }
  },
  setupController(controller, model) {
    this._super(...arguments);
    controller.set('backRouteParams', this.get('backRouteParams'));
    this.get('adminService').setEditingStaff(model.get('id'));
  },
  resetController(controller, isExiting) {
    this._super(...arguments);
    AppUtils.tryRollback(controller.get('model'));
    if (isExiting) {
      this.get('adminService').clearEditingStaff();
    }
  },
});
