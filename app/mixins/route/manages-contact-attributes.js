import * as TypeUtils from 'textup-frontend/utils/type';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';

const { isArray, run } = Ember;

export default Ember.Mixin.create({
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
      this._tryStartObserveContactStatus();
      // check the single contact right now
      this._tryCheckCurrentContactStatus();
      return true;
    },

    onContactStatusChange(contacts, newStatus) {
      // stop watching for contact getting marked as unread while we're viewing it
      // if we are intentionally manually changing this contact's status
      this._stopObserveContactStatus();

      const contactsArray = isArray(contacts) ? contacts : [contacts];
      contactsArray.forEach(contact => contact.set('status', newStatus));
      this.get('dataService')
        .persist(contactsArray)
        .then(() => {
          this.get('controller').notifyPropertyChange('contacts');
          // want to reset `isSelected` flag on all contacts, not just the ones we've updated
          // to give the impression that all have been updated.
          contactsArray.forEach(contact => contact.set('isSelected', false));
        })
        // try to start observing the single contact's status again once we are done manually
        // updating the contact's status. Note that this action should ONLY be to start observing
        // NOT to also check if status is unread. If we also check if status is unread here
        // then users will not be able to manually mark contacts as unread because this change
        // will just be overriden here.
        .finally(() => this._tryStartObserveContactStatus());
    },

    startContactSharingSlideout(contacts) {
      this.get('controller').set('sharingContacts', isArray(contacts) ? contacts : [contacts]);
      this.send(
        'toggleSlideout',
        'slideouts/contact/share',
        this.get('routeName'),
        Constants.SLIDEOUT.OUTLET.DETAIL
      );
    },
    cancelContactSharingSlideout() {
      this.send('closeSlideout');
      this._clearContactSharingChanges();
      this.get('controller').set('sharingContacts', null);
    },
    finishContactSharingSlideout() {
      return this.get('dataService')
        .persist(this.get('controller.sharingContacts'))
        .then(() => this.send('cancelContactSharingSlideout'));
    },
  },

  // Internal methods
  // ----------------

  _clearContactSharingChanges() {
    const contacts = this.get('controller.sharingContacts');
    if (isArray(contacts)) {
      contacts.forEach(contact => contact.clearSharingChanges());
    }
  },

  // only want to observe status when we are viewing a SINGLE contact
  _tryStartObserveContactStatus() {
    if (TypeUtils.isContact(this.get('controller.model'))) {
      // and add an observer for future changes to the status
      this.addObserver('controller.model.status', this, '_currentContactStatusObserver');
    }
  },
  _stopObserveContactStatus() {
    this.removeObserver('controller.model.status', this, '_currentContactStatusObserver');
  },
  // debounce because observer is called every time this property is set, whether or not changed
  _currentContactStatusObserver() {
    run.debounce(this, this._tryCheckCurrentContactStatus, 1000, true);
  },
  // when currently viewing contact receives messages (pushed through socket),
  // the contact is also marked as `unread` but should be re-marked as `active`
  // since the user is already viewing the contact and reading the messages
  _tryCheckCurrentContactStatus() {
    const contact = this.get('controller.model');
    if (TypeUtils.isContact(contact) && contact.get('status') === Constants.CONTACT.STATUS.UNREAD) {
      contact.set('status', Constants.CONTACT.STATUS.ACTIVE);
      this.get('dataService').persist(contact);
    }
  },
});
