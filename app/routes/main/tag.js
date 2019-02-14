import Ember from 'ember';
import MainContactsRoute from 'textup-frontend/routes/main/contacts';

const { computed } = Ember;

export default MainContactsRoute.extend({
  queryParams: null,
  controllerName: 'main/contacts',
  templateName: 'main/contacts',

  phone: computed.alias('stateManager.owner.phone.content'),

  serialize(model) {
    return { tag_identifier: model.get('urlIdentifier') };
  },
  model({ tag_identifier: tagIdent }) {
    const tags = this.get('phone.tags'),
      tag = tags.findBy('urlIdentifier', tagIdent);
    return tag ? tag : this.transitionTo('main.contacts');
  },
  setupController() {
    this._super(...arguments);
    this.get('phone').resetContactsFilter();
  },
});
