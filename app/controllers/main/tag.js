import MainContactsController from 'textup-frontend/controllers/main/contacts';
import { inject as service } from '@ember/service';

export default MainContactsController.extend({
  contactListService: service(),

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
    this.get('contactListService').resetState(this.get('model.id'));
  },
});
