import Route from '@ember/routing/route';
import IsPublic from 'textup-frontend/mixins/route/is-public';

export default Route.extend(IsPublic, {
  redirect() {
    this._super(...arguments);
    this.transitionTo('login');
  },
});
