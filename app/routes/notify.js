import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import Constants from 'textup-frontend/constants';

export default Route.extend({
  requestService: service(),

  queryParams: {
    token: { refreshModel: true },
  },

  model(params) {
    this._super(...arguments);
    const token = params.token;
    if (token) {
      return this.get('requestService').handleIfError(this.store.findRecord('notification', token));
    } else {
      this.transitionTo('login');
    }
  },

  actions: {
    error() {
      this.transitionTo('index');
    },
    openInApp(notification) {
      if (notification) {
        this.transitionTo('main', notification.get(Constants.PROP_NAME.URL_IDENT));
      }
    },
    openCareRecord(notification, detail) {
      if (notification && detail) {
        this.transitionTo(
          detail.get('routeName'),
          notification.get(Constants.PROP_NAME.URL_IDENT),
          detail.get(Constants.PROP_NAME.URL_IDENT)
        );
      }
    },
  },
});
