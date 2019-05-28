import ArrayUtils from 'textup-frontend/utils/array';
import Constants from 'textup-frontend/constants';
import ContactNumberObject from 'textup-frontend/objects/contact-number-object';
import RSVP from 'rsvp';
import Service, { inject as service } from '@ember/service';
import { assign } from '@ember/polyfills';
import { isBlank } from '@ember/utils';

export default Service.extend({
  contactListService: service(),
  dataService: service(),
  stateService: service(),
  store: service(),

  // Methods
  // -------

  createNew() {
    return this.get('store').createRecord(Constants.MODEL.CONTACT, {
      language: this.get('stateService.owner.phone.content.language'),
    });
  },
  persistNew(contact) {
    return this.get('dataService')
      .persist(contact)
      .then(() => this.get('contactListService').tryAddNewToContacts(contact));
  },

  checkNumberDuplicate(contact, contactNumObj) {
    if (contact && contactNumObj instanceof ContactNumberObject) {
      this.searchContacts(contactNumObj.number).then(results => {
        contact.addDuplicatesForNumber(contactNumObj.number, results.toArray());
      });
    }
  },
  removeNumberDuplicate(contact, contactNumObj) {
    if (contact && contactNumObj instanceof ContactNumberObject) {
      contact.removeDuplicatesForNumber(contactNumObj.number);
    }
  },

  updateStatus(contacts, newStatus) {
    const contactsArray = ArrayUtils.ensureArrayAndAllDefined(contacts);
    contactsArray.forEach(contact => contact.set('status', newStatus));
    return this.get('dataService')
      .persist(contactsArray)
      .then(() => {
        // want to reset `isSelected` flag on all contacts, not just the ones we've updated
        // to give the impression that all have been updated.
        contactsArray.forEach(contact => contact.set('isSelected', false));
      });
  },

  searchContacts(search, params = {}) {
    return new RSVP.Promise((resolve, reject) => {
      if (isBlank(search)) {
        return resolve([]);
      }
      // teamId added by `contact` adapter
      this.get('store')
        .query(Constants.MODEL.CONTACT, assign({ search }, params))
        .then(results => resolve(results.toArray()), reject);
    });
  },
});
