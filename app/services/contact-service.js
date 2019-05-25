import ArrayUtils from 'textup-frontend/utils/array';
import Constants from 'textup-frontend/constants';
import ContactNumberObject from 'textup-frontend/objects/contact-number-object';
import RSVP from 'rsvp';
import Service, { inject as service } from '@ember/service';
import TypeUtils from 'textup-frontend/utils/type';
import { assign } from '@ember/polyfills';
import { isBlank } from '@ember/utils';

export default Service.extend({
  dataService: service(),
  router: service(),
  stateService: service(),
  store: service(),

  // Methods
  // -------

  createNew() {
    return this.get('store').createRecord(Constants.MODEL.CONTACT, {
      language: this.get('stateService.owner.phone.content.language'),
    });
  },
  persistNewAndTryAddToPhone(contact) {
    const stateService = this.get('stateService'),
      phone = stateService.get('owner.phone.content');
    return this.get('dataService')
      .persist(contact)
      .then(() => {
        // add new contact to the beginning of the currently-shown list if it is viewing all contacts
        // and not a specific tag's contacts. Phone will handle filtering for statuses + sorting.
        if (TypeUtils.isPhone(phone) && stateService.get('viewingContacts')) {
          phone.addContacts(contact);
        }
      });
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

  showFilteredContacts(filter) {
    const phone = this.get('stateService.owner.phone.content');
    if (phone) {
      phone.set('contactsFilter', filter);
    }
    this.get('router').transitionTo('main.contacts', { queryParams: { filter } });
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
