import AppUtils from 'textup-frontend/utils/app';
import Route from '@ember/routing/route';

export default Route.extend({
  actions: {
    willTransition({ targetName }) {
      this._super(...arguments);
      if (targetName === 'signup.new') {
        const signupController = this.controllerFor('signup'),
          staff = signupController.get('staff');
        if (staff.get('isDeleted') === false) {
          AppUtils.tryRollback(staff);
          signupController.set('staff', this.get('store').createRecord('staff'));
        }
      }
    },
  },
});
