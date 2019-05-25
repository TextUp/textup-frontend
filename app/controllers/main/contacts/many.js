import Controller from '@ember/controller';
import { readOnly, filterBy, empty } from '@ember/object/computed';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { next } from '@ember/runloop';

export default Controller.extend({
  stateService: service(),

  selectedContacts: filterBy('stateService.owner.phone.content.contacts', 'isSelected', true),
  allContacts: readOnly('stateService.owner.phone.content.contacts'),

  // when no shared with me select OR all of the shared with me selected are DELEGATE permission
  canMessageSelectedContacts: computed('selectedContacts', function() {
    return (
      this.get('noSharedWithMeSelected') ||
      this.get('selectedAndSharedContacts').isEvery('isDelegatePermission')
    );
  }),
  selectedAndSharedContacts: filterBy('selectedContacts', 'isShared', true),
  hasNoSharedContactsSelected: empty('selectedAndSharedContacts'),

  actions: {
    selectAllContacts() {
      this.get('allContacts').forEach(contact => contact.set('isSelected', true));
    },
    selectAllMyContacts() {
      this.get('allContacts').forEach(contact => {
        if (contact.get('isShared')) {
          contact.set('isSelected', false);
        } else {
          contact.set('isSelected', true);
        }
      });
    },
    deselectContact(contact) {
      contact.set('isSelected', false);
      next(this, this.exitManyIfNoSelected);
    },
    deselectAllContactsAndExit() {
      this.deselectAllContacts();
      this._exitMany();
    },
  },

  exitManyIfNoSelected() {
    if (this.get('selectedContacts.length') === 0) {
      this._exitMany();
    }
  },
  deselectAllContacts() {
    this.get('selectedContacts').forEach(contact => contact.set('isSelected', false));
  },

  // Internal
  // --------

  _backRouteName: 'main.contacts',
  _exitMany() {
    this.transitionToRoute(this.get('_backRouteName'));
  },
});
