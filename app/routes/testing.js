import Ember from 'ember';

export default Ember.Route.extend({
  exportContacts() {
    console.log('contacts export called');
  },

  actions: {
    saveContacts(contacts) {
      console.log(contacts);
    },
  },
});
