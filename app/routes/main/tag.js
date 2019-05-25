import Constants from 'textup-frontend/constants';
import MainContactsRoute from 'textup-frontend/routes/main/contacts';
import { inject as service } from '@ember/service';

export default MainContactsRoute.extend({
  stateService: service(),

  // @Override
  queryParams: null,

  serialize(model) {
    return { tag_identifier: model.get(Constants.PROP_NAME.URL_IDENT) };
  },
  model({ tag_identifier: tagIdent }) {
    const tags = this.get('stateService.owner.phone.content.tags'),
      tag = tags.findBy(Constants.PROP_NAME.URL_IDENT, tagIdent);
    if (tag) {
      return tag;
    } else {
      this.transitionTo('main.contacts');
    }
  },
});
