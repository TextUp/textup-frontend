import Ember from 'ember';

const { isArray } = Ember;

export default Ember.Mixin.create({
  dataService: Ember.inject.service(),

  setupController(controller) {
    this._super(...arguments);
    controller.set('sharingContacts', null);
  },

  actions: {
    onContactStatusChange(contacts, newStatus) {
      const contactsArray = isArray(contacts) ? contacts : [contacts];
      contactsArray.forEach(contact => contact.set('status', newStatus));
      this.get('dataService')
        .persist(contactsArray)
        .then(updatedContacts => {
          this.get('controller').notifyPropertyChange('contacts');
          updatedContacts.forEach(contact => contact.set('isSelected', false));
        });
    },

    startContactSharingSlideout(contacts) {
      this.get('controller').set('sharingContacts', isArray(contacts) ? contacts : [contacts]);
      this.send(
        'toggleSlideout',
        'slideouts/contact/share',
        this.get('routeName'),
        this.get('constants.SLIDEOUT.OUTLET.DETAIL')
      );
    },
    cancelContactSharingSlideout() {
      this.send('closeSlideout');
      this._clearContactSharingChanges();
      this.get('controller').set('sharingContacts', null);
    },
    finishContactSharingSlideout() {
      this.get('dataService')
        .persist(this.get('controller.sharingContacts'))
        .then(() => this.send('cancelContactSharingSlideout'));
    }
  },
  _clearContactSharingChanges() {
    const contacts = this.get('controller.sharingContacts');
    if (isArray(contacts)) {
      contacts.forEach(contact => contact.clearSharingChanges());
    }
  }
});
