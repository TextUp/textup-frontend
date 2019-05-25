import Controller, { inject as controller } from '@ember/controller';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  signupController: controller('signup'),

  staff: alias('signupController.staff'),
  selected: alias('signupController.selected'),
  confirmPassword: null,
  isValidCaptcha: false,
  showTermsOfUse: false,
  showPrivacyPolicy: false,
  didAcceptPolicies: false,
});
