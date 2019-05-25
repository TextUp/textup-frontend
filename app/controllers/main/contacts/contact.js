import Constants from 'textup-frontend/constants';
import MainTagDetailsController from 'textup-frontend/controllers/main/tag/details';
import TypeUtils from 'textup-frontend/utils/type';
import { debounce } from '@ember/runloop';
import { inject as service } from '@ember/service';

export default MainTagDetailsController.extend({
  contactService: service(),

  backRouteName: null,
  backRouteLinkParams: null,

  actions: {
    onContactStatusChange(contacts, newStatus) {
      // stop watching for contact getting marked as unread while we're viewing it
      // if we are intentionally manually changing this contact's status
      this.stopObserveContactStatus();
      this.get('contactService')
        .updateStatus(contacts, newStatus)
        // try to start observing the single contact's status again once we are done manually
        // updating the contact's status. Note that this action should ONLY be to start observing
        // NOT to also check if status is unread. If we also check if status is unread here
        // then users will not be able to manually mark contacts as unread because this change
        // will just be overridden here.
        .finally(() => this.tryStartObserveContactStatus());
    },
  },

  // Methods
  // -------

  // only want to observe status when we are viewing a SINGLE contact
  tryStartObserveContactStatus() {
    if (TypeUtils.isContact(this.get('model'))) {
      // and add an observer for future changes to the status
      this.addObserver('model.status', this, '_currentContactStatusObserver');
      // also calls observer to check right now
      this._tryCheckCurrentContactStatus();
    }
  },
  stopObserveContactStatus() {
    this.removeObserver('model.status', this, '_currentContactStatusObserver');
  },

  // Internal
  // --------

  // debounce because observer is called every time this property is set, whether or not changed
  _currentContactStatusObserver() {
    debounce(this, this._tryCheckCurrentContactStatus, 1000, true);
  },
  // when currently viewing contact receives messages (pushed through socket),
  // the contact is also marked as `unread` but should be re-marked as `active`
  // since the user is already viewing the contact and reading the messages
  _tryCheckCurrentContactStatus() {
    const contact = this.get('model');
    if (TypeUtils.isContact(contact) && contact.get('status') === Constants.CONTACT.STATUS.UNREAD) {
      contact.set('status', Constants.CONTACT.STATUS.ACTIVE);
      this.get('dataService').persist(contact);
    }
  },
});
