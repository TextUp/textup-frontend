import { next } from '@ember/runloop';
import Route from '@ember/routing/route';

export default Route.extend({
  setupController(controller) {
    this._super(...arguments);
    const signupController = this.controllerFor('signup');
    if (signupController.get('selected')) {
      controller.set('org', signupController.get('selected'));
    } else {
      const newOrg = this.get('store').createRecord('organization', {
        location: this.get('store').createRecord('location'),
      });
      controller.set('org', newOrg);
      // set next so that setting select is not overwritten
      // by the setup process, which sets selected to null
      next(this, function() {
        signupController.set('selected', newOrg);
      });
    }
  },

  actions: {
    willTransition({ targetName }) {
      this._super(...arguments);
      if (targetName === 'signup.index') {
        const signupController = this.controllerFor('signup'),
          staff = signupController.get('staff'),
          selected = signupController.get('selected');
        if (staff && staff.get('isDeleted') === false) {
          staff.rollbackAttributes();
          signupController.set('staff', this.get('store').createRecord('staff'));
        }
        if (selected) {
          selected.get('location.content').rollbackAttributes();
          selected.rollbackAttributes();
          signupController.set('selected', null);
        }
      }
    },
  },
});
