import MainContactsController from 'textup-frontend/controllers/main/contacts';
import { assign } from '@ember/polyfills';

export default MainContactsController.extend({
  actions: {
    // @Override
    toggleSelected(contact) {
      if (contact) {
        this.transitionTo('main.tag.many');
        contact.toggleProperty('isSelected');
      }
    },
  },

  // @Override
  resetState() {
    this._super(...arguments);
    this.get('phone').resetContactsFilter();
  },

  // Internal
  // --------

  // @Override
  _buildLoadParams() {
    return assign(this._super(...arguments), { tagId: this.get('model.id') });
  },
});
