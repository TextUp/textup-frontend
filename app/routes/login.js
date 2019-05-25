import IsPublic from 'textup-frontend/mixins/route/is-public';
import Route from '@ember/routing/route';

export default Route.extend(IsPublic, {
  deactivate() {
    this._super(...arguments);
    this.controller.setProperties({
      username: null,
      password: null,
      resetUsername: null,
    });
  },
});
