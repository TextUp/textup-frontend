import Constants from 'textup-frontend/constants';
import RSVP, { all } from 'rsvp';
import Service, { inject as service } from '@ember/service';
import TypeUtils from 'textup-frontend/utils/type';
import { later } from '@ember/runloop';

export default Service.extend({
  dataService: service(),
  requestService: service(),
  stateService: service(),
  store: service(),

  createNew() {
    return this.get('store').createRecord(Constants.MODEL.TAG, {
      language: this.get('stateService.owner.phone.content.language'),
    });
  },
  persistNew(newTag) {
    return this.get('dataService')
      .persist(newTag)
      .then(() => {
        const phone = this.get('stateService.owner.phone.content');
        if (TypeUtils.isPhone(phone)) {
          phone.get('tags').then(tags => tags.pushObject(newTag));
        }
      });
  },
  updateTagMemberships(tags, contacts) {
    return this.get('dataService')
      .persist(tags)
      .then(() => this._reloadContactsAfterDelay(contacts));
  },

  // Helpers
  // -------

  // [FUTURE] batch reloading of contacts so we don't many so many requests to the backend
  // allows for some time for the backend to save the new membership state
  _reloadContactsAfterDelay(contacts) {
    return new RSVP.Promise((resolve, reject) => {
      later(() => {
        this.get('requestService')
          .handleIfError(all(contacts.map(contact => contact.reload())))
          .then(resolve, reject);
      }, 1000);
    });
  },
});
