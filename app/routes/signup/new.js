import AppUtils from 'textup-frontend/utils/app';
import Constants from 'textup-frontend/constants';
import Route from '@ember/routing/route';
import { next } from '@ember/runloop';

export default Route.extend({
  setupController(controller) {
    this._super(...arguments);
    const signupController = this.controllerFor('signup');
    if (signupController.get('selected')) {
      controller.set('org', signupController.get('selected'));
    } else {
      const newOrg = this.get('store').createRecord(Constants.MODEL.ORG, {
        location: this.get('store').createRecord(Constants.MODEL.LOCATION),
      });
      controller.set('org', newOrg);
      // set next so that setting select is not overwritten
      // by the setup process, which sets selected to null
      next(this, () => signupController.set('selected', newOrg));
    }
  },

  actions: {
    willTransition({ targetName }) {
      this._super(...arguments);
      if (targetName === 'signup.index') {
        const signupController = this.controllerFor('signup');
        AppUtils.tryRollback(signupController.get('staff'));
        AppUtils.tryRollback(signupController.get('selected'));
        signupController.setProperties({
          staff: this.get('store').createRecord(Constants.MODEL.STAFF),
          selected: null,
        });
      }
    },
  },
});
