import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import IsPublic from 'textup-frontend/mixins/route/is-public';

export default Route.extend(IsPublic, {
  authService: service(),

  deactivate() {
    this._super(...arguments);
    this.controller.setProperties({
      username: null,
      password: null,
      resetUsername: null,
    });
  },
  actions: {
    login(un, pwd, doStore) {
      return this.get('authService')
        .login(un, pwd, doStore)
        .then(staff => this.transitionTo('main', staff));
    },
  },
});
