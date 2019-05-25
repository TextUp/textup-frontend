import Route from '@ember/routing/route';

export default Route.extend({
  beforeModel() {
    this._super(...arguments);
    const signupController = this.controllerFor('signup');
    if (!signupController.get('selected') || !signupController.get('staff')) {
      this.transitionTo('signup.index');
    }
  },
  resetController(controller) {
    this._super(...arguments);
    controller.setProperties({
      confirmPassword: null,
      isValidCaptcha: false,
      didAcceptPolicies: false,
    });
  },
});
