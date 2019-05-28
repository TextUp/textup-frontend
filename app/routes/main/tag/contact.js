import Constants from 'textup-frontend/constants';
import MainContactsContactRoute from 'textup-frontend/routes/main/contacts/contact';
import { inject as service } from '@ember/service';

export default MainContactsContactRoute.extend({
  authService: service(),

  controllerName: 'main/contacts/contact',
  templateName: 'main/contacts/contact',

  // @Override
  backRouteName: 'main.tag',
  // @Override
  backRouteLinkParams: null,

  activate() {
    this._super(...arguments);
    this.set('backRouteLinkParams', [
      this.get(`authService.authUser.${Constants.PROP_NAME.URL_IDENT}`),
      this.modelFor('main.tag').get(Constants.PROP_NAME.URL_IDENT),
    ]);
  },
});
