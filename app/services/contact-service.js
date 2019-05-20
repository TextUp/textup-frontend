import Service, { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import Constants from 'textup-frontend/constants';
import ContactNumberObject from 'textup-frontend/objects/contact-number-object';
import TypeUtils from 'textup-frontend/utils/type';

export default Service.extend({
  dataService: service(),
  stateService: service(),
  store: service(),

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
      this.searchContactsByNumber(contactNumObj.number).then(results => {
        contact.addDuplicatesForNumber(contactNumObj.number, results.toArray());
      });
    }
  },
  removeNumberDuplicate(contact, contactNumObj) {
    if (contact && contactNumObj instanceof ContactNumberObject) {
      contact.removeDuplicatesForNumber(contactNumObj.number);
    }
  },

  searchContactsByNumber(number, params = {}) {
    return new RSVP.Promise((resolve, reject) => {
      params.search = number;
      // teamId added by `contact` adapter
      this.get('store')
        .query(Constants.MODEL.CONTACT, params)
        .then(resolve, reject);
    });
  },
});
