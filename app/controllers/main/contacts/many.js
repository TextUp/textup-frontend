import Ember from 'ember';

const { filterBy, empty, alias } = Ember.computed;

export default Ember.Controller.extend({
  contactsController: Ember.inject.controller('main.contacts'),

  // routes that want to use this controller but do not reuse the
  // contacts controller can override these properties
  selected: filterBy('contactsController.contacts', 'isSelected', true),
  allContacts: alias('contactsController.contacts'),

  // can message when no shared with me select OR all
  // of the shared with me selected are DELEGATE permission
  selectedCanMessage: Ember.computed('selected', function() {
    return (
      this.get('noSharedWithMeSelected') ||
      this.get('sharedWithMeSelected').every(contact => contact.get('isSharedDelegate'))
    );
  }),
  sharedWithMeSelected: filterBy('selected', 'isShared', true),
  noSharedWithMeSelected: empty('sharedWithMeSelected'),

  actions: {
    selectAll: function() {
      this.get('allContacts').forEach(contact => {
        contact.set('isSelected', true);
      });
    },
    selectAllMyContacts: function() {
      this.get('allContacts').forEach(contact => {
        if (contact.get('isShared')) {
          contact.set('isSelected', false);
        } else {
          contact.set('isSelected', true);
        }
      });
    },
    deselect: function(contact) {
      contact.set('isSelected', false);
      Ember.run.next(this, function() {
        if (this.get('selected.length') === 0) {
          this._exitMany();
        }
      });
    },
    leave: function() {
      this._deselectAll();
      this._exitMany();
    }
  },

  // Helpers
  // -------

  _deselectAll: function() {
    this.get('selected').forEach(contact => {
      contact.set('isSelected', false);
    });
  },
  _exitMany: function() {
    this.transitionToRoute(this.get('backRouteName'));
  }
});
