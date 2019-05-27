import Constants from 'textup-frontend/constants';
import MainContactsRoute from 'textup-frontend/routes/main/contacts';
import { inject as service } from '@ember/service';

export default MainContactsRoute.extend({
  stateService: service(),

  serialize(model) {
    return { tag_identifier: model.get(Constants.PROP_NAME.URL_IDENT) };
  },
  model({ tag_identifier }) {
    const tag = this.get('stateService.owner.phone.content.tags').findBy(
      Constants.PROP_NAME.URL_IDENT,
      tag_identifier
    );
    if (tag) {
      return tag;
    } else {
      this.transitionTo('main.contacts');
    }
  },
});
