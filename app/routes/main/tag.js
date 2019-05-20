import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Constants from 'textup-frontend/constants';
import MainContactsRoute from 'textup-frontend/routes/main/contacts';

export default MainContactsRoute.extend({
  stateService: service(),

  queryParams: null,
  controllerName: 'main/contacts',
  templateName: 'main/contacts',

  phone: alias('stateService.owner.phone.content'),

  serialize(model) {
    return { tag_identifier: model.get(Constants.PROP_NAME.URL_IDENT) };
  },
  model({ tag_identifier: tagIdent }) {
    const tags = this.get('phone.tags'),
      tag = tags.findBy(Constants.PROP_NAME.URL_IDENT, tagIdent);
    return tag ? tag : this.transitionTo('main.contacts');
  },
  setupController() {
    this._super(...arguments);
    this.get('phone').resetContactsFilter();
  },
});
