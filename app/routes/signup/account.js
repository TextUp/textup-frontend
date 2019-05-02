import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';

export default Ember.Route.extend({
  authService: Ember.inject.service(),
  requestService: Ember.inject.service(),

  setupController(controller) {
    const signupController = this.controllerFor('signup'),
      newStaff = signupController.get('staff'),
      selected = signupController.get('selected');
    if (!selected || !newStaff) {
      this.transitionTo('signup.index');
    }
    controller.setProperties({ selected, staff: newStaff });
  },
  deactivate() {
    this.controller.set('confirmPassword', null);
    this.controller.set('didAcceptPolicies', false);
  },

  actions: {
    // Creating new staff
    // ------------------

    createStaff(data) {
      const { password } = data.toJSON(),
        org = this.controller.get('selected'),
        toBeSaved = { staff: data.toJSON() };
      // build org based on if new or existing
      toBeSaved.staff.org = org.get('isNew')
        ? {
            name: org.get('name'),
            location: org.get('location.content').toJSON(),
          }
        : { id: org.get('id') };
      return this.get('requestService')
        .handleIfError(
          Ember.$.ajax({
            type: Constants.REQUEST_METHOD.POST,
            url: `${config.host}/v1/public/staff`,
            contentType: Constants.MIME_TYPE.JSON,
            data: JSON.stringify(toBeSaved),
          })
        )
        .then(result => this._logInAfterCreate(result.staff, password));
    },
  },

  _logInAfterCreate(staffObj, password) {
    this.get('notifications').success(`Almost done creating your account...`);
    const staff = this.store.push(this.store.normalize(Constants.MODEL.STAFF, staffObj));
    return this.get('authService')
      .login(staff.get('username'), password)
      .then(() => {
        this.get('notifications').success(`Success! Welcome ${staff.get('name')}!`);
        this.transitionTo('none');
      });
  },
});
