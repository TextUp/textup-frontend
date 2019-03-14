import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import MainContactsRoute from 'textup-frontend/routes/main/contacts';

const { computed } = Ember;

export default MainContactsRoute.extend({
  queryParams: null,
  controllerName: 'main/contacts',
  templateName: 'main/contacts',

  phone: computed.alias('stateManager.owner.phone.content'),

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
