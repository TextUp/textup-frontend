import Constants from 'textup-frontend/constants';
import Ember from 'ember';

export default Ember.Route.extend({
  dataService: Ember.inject.service(),

  queryParams: {
    token: { refreshModel: true },
  },

  model(params) {
    this._super(...arguments);
    const token = params.token;
    if (token) {
      return this.get('dataService').request(this.store.findRecord('notification', token));
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
