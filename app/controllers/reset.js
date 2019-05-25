import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  passwordResetService: service(),

  queryParams: ['token'],
  token: '',

  newPassword: '',
  confirmNewPassword: '',

  actions: {
    completeReset(newPassword) {
      return this.get('passwordResetService')
        .updatePasswordWithToken(this.get('token'), newPassword)
        .then(() => this.transitionToRoute('login'));
    },
  },
});
