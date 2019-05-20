import { alias, filterBy, empty } from '@ember/object/computed';
import { next } from '@ember/runloop';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  stateService: service(),

  phone: alias('stateService.owner.phone.content'),

  // routes that want to use this controller but do not reuse the
  // contacts controller can override these properties
  selected: filterBy('phone.contacts', 'isSelected', true),
  allContacts: alias('phone.contacts'),

  // can message when no shared with me select OR all
  // of the shared with me selected are DELEGATE permission
  selectedCanMessage: computed('selected', function() {
    return (
      this.get('noSharedWithMeSelected') ||
      this.get('sharedWithMeSelected').every(contact => contact.get('isDelegatePermission'))
    );
  }),
  sharedWithMeSelected: filterBy('selected', 'isShared', true),
  noSharedWithMeSelected: empty('sharedWithMeSelected'),

  actions: {
    selectAll() {
      this.get('allContacts').forEach(contact => {
        contact.set('isSelected', true);
      });
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
    deselect(contact) {
      contact.set('isSelected', false);
      next(this, function() {
        if (this.get('selected.length') === 0) {
          this.send('exitMany');
        }
      });
    },
    leave() {
      this._deselectAll();
      this.send('exitMany');
    },
  },

  // Helpers
  // -------

  _deselectAll() {
    this.get('selected').forEach(contact => {
      contact.set('isSelected', false);
    });
  },
});
