import Ember from 'ember';
import TypeUtils from 'textup-frontend/utils/type';

const { RSVP } = Ember;

export default Ember.Service.extend({
  dataService: Ember.inject.service(),
  stateManager: Ember.inject.service('state'),
  store: Ember.inject.service(),

  createNew() {
    return this.get('store').createRecord('contact', {
      language: this.get('stateManager.owner.phone.content.language'),
    });
  },
  persistNewAndTryAddToPhone(contact) {
    const stateManager = this.get('stateManager'),
      phone = stateManager.get('owner.phone.content');
    return this.get('dataService')
      .persist(contact)
      .then(() => {
        // add new contact to the beginning of the currently-shown list if it is viewing all contacts
        // and not a specific tag's contacts. Phone will handle filtering for statuses.
        if (TypeUtils.isPhone(phone) && stateManager.get('viewingContacts')) {
          phone.addContacts(contact, true);
        }
      });
  },

  checkNumberDuplicate(contact, addedNum) {
    if (!contact || !addedNum) {
      return;
    }
    this.searchContactsByNumber(addedNum).then(results => {
      contact.addDuplicatesForNumber(addedNum, results.toArray());
    });
  },
  removeNumberDuplicate(contact, removedNum) {
    if (!contact || !removedNum) {
      return;
    }
    contact.removeDuplicatesForNumber(removedNum);
  },
  searchContactsByNumber(number, params = Object.create(null)) {
    return new RSVP.Promise((resolve, reject) => {
      params.search = number;
      params.teamId = this.get('stateManager.ownerAsTeam.id');
      this.get('store')
        .query('contact', params)
        .then(resolve, reject);
    });
  },
});
