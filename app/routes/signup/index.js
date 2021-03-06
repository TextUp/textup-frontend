import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    willTransition({ targetName }) {
      this._super(...arguments);
      if (targetName === 'signup.new') {
        const signupController = this.controllerFor('signup'),
          staff = signupController.get('staff');
        if (staff.get('isDeleted') === false) {
          staff.rollbackAttributes();
          signupController.set('staff', this.store.createRecord('staff'));
        }
      }
    }
  }
});
