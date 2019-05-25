import Constants from 'textup-frontend/constants';
import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['token'],
  token: '',

  actions: {
    openInApp(notification) {
      if (notification) {
        this.transitionToRoute('main', notification.get(Constants.PROP_NAME.URL_IDENT));
      }
    },
    openCareRecord(notification, detail) {
      if (notification && detail) {
        this.transitionToRoute(
          detail.get('routeName'),
          notification.get(Constants.PROP_NAME.URL_IDENT),
          detail.get(Constants.PROP_NAME.URL_IDENT)
        );
      }
    },
  },
});
