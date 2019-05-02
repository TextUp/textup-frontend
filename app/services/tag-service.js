import Constants from 'textup-frontend/constants';
import Ember from 'ember';

const { RSVP, run } = Ember;

export default Ember.Service.extend({
  dataService: Ember.inject.service(),
  requestService: Ember.inject.service(),
  stateService: Ember.inject.service(),
  store: Ember.inject.service(),

  createNew() {
    return this.get('store').createRecord(Constants.MODEL.TAG, {
      language: this.get('stateService.owner.phone.content.language'),
    });
  },
  persistNew(tag, { model }) {
    return this.get('dataService')
      .persist(tag)
      .then(() => model.get('phone'))
      .then(phone => phone.get('tags'))
      .then(tags => tags.pushObject(tag));
  },
  updateTagMemberships(tags, contacts) {
    return this.get('dataService')
      .persist(tags)
      .then(() => this._reloadContactsAfterDelay(contacts));
  },

  // Helpers
  // -------

  // allows for some time for the backend to save the new membership state
  _reloadContactsAfterDelay(contacts) {
    return new RSVP.Promise((resolve, reject) => {
      run.later(() => {
        this.get('requestService')
          .handleIfError(Ember.RSVP.all(contacts.map(contact => contact.reload())))
          .then(resolve, reject);
      }, 1000);
    });
  },
});
