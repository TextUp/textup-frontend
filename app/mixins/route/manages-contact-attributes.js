import Ember from 'ember';

const { computed, isArray, run } = Ember;

export default Ember.Mixin.create({
  constants: Ember.inject.service(),
  dataService: Ember.inject.service(),

  setupController(controller) {
    this._super(...arguments);
    controller.set('sharingContacts', null);
  },
  deactivate() {
    this._super(...arguments);
    this._stopObserveContactStatus();
  },

  actions: {
    willTransition() {
      this._super(...arguments);
      this._stopObserveContactStatus();
      return true;
    },
    didTransition() {
      this._super(...arguments);
      this._tryCheckAndObserveContactStatus();
      return true;
    },

    onContactStatusChange(contacts, newStatus) {
      // stop watching for contact getting marked as unread while we're viewing it
      // if we are intentionally manually changing this contact's tatus
      this._stopObserveContactStatus();

      const contactsArray = isArray(contacts) ? contacts : [contacts];
      contactsArray.forEach(contact => contact.set('status', newStatus));
      this.get('dataService')
        .persist(contactsArray)
        .then(updatedContacts => {
          this.get('controller').notifyPropertyChange('contacts');
          updatedContacts.forEach(contact => contact.set('isSelected', false));
        })
        // try to start observing the single contact's status again once we are done manually
        // updating the contact's status
        .finally(() => this._tryCheckAndObserveContactStatus());
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

  // Internal properties
  // -------------------

  _isViewingSingleContact: computed('controller.model.constructor.modelName', function() {
    return (
      this.get('controller.model.constructor.modelName') === this.get('constants.MODEL.CONTACT')
    );
  }),

  // Internal methods
  // ----------------

  _clearContactSharingChanges() {
    const contacts = this.get('controller.sharingContacts');
    if (isArray(contacts)) {
      contacts.forEach(contact => contact.clearSharingChanges());
    }
  },

  // only want to observe status when we are viewing a SINGLE contact
  _tryCheckAndObserveContactStatus() {
    if (this.get('_isViewingSingleContact')) {
      // check the single contact right now
      this._checkCurrentContactStatus();
      // and add an observer for future changes to the status
      this.addObserver('controller.model.status', this, '_currentContactStatusObserver');
    }
  },
  _stopObserveContactStatus() {
    this.removeObserver('controller.model.status', this, '_currentContactStatusObserver');
  },
  // debounce because observer is called every time this property is set, whether or not changed
  _currentContactStatusObserver() {
    run.debounce(this, this._checkCurrentContactStatus, 1000, true);
  },
  // when currently viewing contact receives messages (pushed through socket),
  // the contact is also marked as `unread` but should be re-marked as `active`
  // since the user is already viewing the contact and reading the messages
  _checkCurrentContactStatus() {
    const contact = this.get('controller.model');
    if (contact.get('status') === this.get('constants.CONTACT.STATUS.UNREAD')) {
      contact.set('status', this.get('constants.CONTACT.STATUS.ACTIVE'));
      this.get('dataService').persist(contact);
    }
  }
});
