import Ember from 'ember';
import IsPublic from 'textup-frontend/mixins/route/is-public';

export default Ember.Route.extend(IsPublic, {
  authService: Ember.inject.service(),

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
