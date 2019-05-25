import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  authService: service(),

  username: null,
  password: null,
  resetUsername: null,

  actions: {
    login(un, pwd, doStore) {
      return this.get('authService')
        .login(un, pwd, doStore)
        .then(staff => this.transitionToRoute('main', staff));
    },
  },
});
