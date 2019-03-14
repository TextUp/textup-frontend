import Ember from 'ember';

const { computed } = Ember;

export default Ember.Controller.extend({
  phone: computed.alias('stateManager.owner.phone.content'),

  // routes that want to use this controller but do not reuse the
  // contacts controller can override these properties
  selected: computed.filterBy('phone.contacts', 'isSelected', true),
  allContacts: computed.alias('phone.contacts'),

  // can message when no shared with me select OR all
  // of the shared with me selected are DELEGATE permission
  selectedCanMessage: Ember.computed('selected', function() {
    return (
      this.get('noSharedWithMeSelected') ||
      this.get('sharedWithMeSelected').every(contact => contact.get('isDelegatePermission'))
    );
  }),
  sharedWithMeSelected: computed.filterBy('selected', 'isShared', true),
  noSharedWithMeSelected: computed.empty('sharedWithMeSelected'),

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
      Ember.run.next(this, function() {
        if (this.get('selected.length') === 0) {
          this._exitMany();
        }
      });
    },
    leave() {
      this._deselectAll();
      this._exitMany();
    },
  },

  // Helpers
  // -------

  _deselectAll() {
    this.get('selected').forEach(contact => {
      contact.set('isSelected', false);
    });
  },
  _exitMany() {
    this.transitionToRoute(this.get('backRouteName'));
  },
});
