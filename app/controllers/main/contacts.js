import Controller from '@ember/controller';
import PropertyUtils from 'textup-frontend/utils/property';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Controller.extend({
  contactListService: service(),

  queryParams: ['filter'],
  filter: alias('contactListService.filter'),
  contactsList: null,

  actions: {
    toggleSelected(contact) {
      if (contact) {
        this.transitionTo('main.contacts.many');
        contact.toggleProperty('isSelected');
      }
    },
  },

  resetState() {
    PropertyUtils.callIfPresent(this.get('contactsList.actions.resetAll'));
    this.get('contactListService').resetState();
  },
});
