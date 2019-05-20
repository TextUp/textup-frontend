import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import Constants from 'textup-frontend/constants';
import MainContactsContactRoute from 'textup-frontend/routes/main/contacts/contact';

export default MainContactsContactRoute.extend({
  authService: service(),

  backRouteName: 'main.tag',
  backRouteLinkParams: computed(
    `authService.authUser.${Constants.PROP_NAME.URL_IDENT}`,
    function() {
      return [
        this.get(`authService.authUser.${Constants.PROP_NAME.URL_IDENT}`),
        this.modelFor('main.tag').get(Constants.PROP_NAME.URL_IDENT),
      ];
    }
  ),
});
