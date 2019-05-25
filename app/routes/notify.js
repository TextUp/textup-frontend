import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  requestService: service(),

  queryParams: {
    token: { refreshModel: true },
  },

  model(params) {
    this._super(...arguments);
    const token = params.token;
    if (token) {
      return this.get('requestService').handleIfError(
        this.get('store').findRecord('notification', token)
      );
    } else {
      this.transitionTo('login');
    }
  },

  actions: {
    error() {
      this.transitionTo('index');
    },
  },
});
