import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  adminService: service(),
  dataService: service(),

  model(params) {
    const id = params.id;
    if (id) {
      const found = this.store.peekRecord('staff', id);
      return found ? found : this.store.findRecord('staff', id);
    } else {
      this.transitionTo('admin.people');
    }
  },
  setupController(controller, model) {
    this._super(...arguments);
    controller.set('person', model);
    controller.set('team', null);
  },
  deactivate() {
    this._super(...arguments);
    this.get('adminService').clearEditingStaff();
  },

  actions: {
    // use will transition so that current model is
    // still the model of the route we are about to leave
    willTransition() {
      this._super(...arguments);
      this.get('dataService').revert(this.get('currentModel'));
      return true;
    },
    didTransition() {
      this._super(...arguments);
      this.get('adminService').setEditingStaff(this.get('currentModel.id'));
      return true;
    },
  },
});
