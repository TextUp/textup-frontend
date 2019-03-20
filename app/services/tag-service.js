import Ember from 'ember';

export default Ember.Service.extend({
  dataService: Ember.inject.service(),
  stateManager: Ember.inject.service('state'),
  store: Ember.inject.service(),

  createNew() {
    return this.get('store').createRecord('tag', {
      language: this.get('stateManager.owner.phone.content.language'),
    });
  },
  persistNew(tag, { model }) {
    return this.get('dataService')
      .persist(tag)
      .then(() => {
        model.get('phone').then(phone => {
          phone.get('tags').then(tags => tags.pushObject(tag));
        });
      });
  },
  updateTagMemberships(tags, contacts) {
    return this.get('dataService')
      .persist(tags)
      .then(() => {
        return this.get('dataService').request(
          Ember.RSVP.all(contacts.map(contact => contact.reload()))
        );
      });
  },
});
