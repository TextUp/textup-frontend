import Ember from 'ember';

const { isArray, RSVP } = Ember;

export default Ember.Service.extend({
  dataService: Ember.inject.service(),
  stateManager: Ember.inject.service('state'),
  store: Ember.inject.service(),

  createNew() {
    return this.get('store').createRecord('contact', {
      language: this.get('stateManager.owner.phone.content.language')
    });
  },
  persistNew(contact, { displayedList, currentFilter }) {
    return this.get('dataService')
      .persist(contact)
      .then(() => {
        // add new contact to the beginning of the currently-shown list if is showing all
        if (isArray(displayedList) && currentFilter === 'all') {
          displayedList.unshiftObject(contact);
        }
      });
  },

  checkNumberDuplicate(contact, addedNum) {
    if (!contact) {
      return;
    }
    this.searchContactsByNumber(addedNum).then(results => {
      contact.addDuplicatesForNumber(addedNum, results.toArray());
    });
  },
  removeNumberDuplicate(contact, removedNum) {
    if (!contact) {
      return;
    }
    contact.removeDuplicatesForNumber(removedNum);
  },
  searchContactsByNumber(number, params = Object.create(null)) {
    return new RSVP.Promise((resolve, reject) => {
      const teamId = this.get('stateManager.ownerAsTeam.id');
      params.search = number;
      if (teamId) {
        params.teamId = teamId;
      }
      this.get('store')
        .query('contact', params)
        .then(resolve, reject);
    });
  }
});
