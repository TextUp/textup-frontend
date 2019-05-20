import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import MainContactsContactRoute from 'textup-frontend/routes/main/contacts/contact';

const { computed } = Ember;

export default MainContactsContactRoute.extend({
  authService: Ember.inject.service(),

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
