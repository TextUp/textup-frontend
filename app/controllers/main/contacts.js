import Constants from 'textup-frontend/constants';
import Controller from '@ember/controller';
import RSVP from 'rsvp';
import TextUtils from 'textup-frontend/utils/text';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
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
