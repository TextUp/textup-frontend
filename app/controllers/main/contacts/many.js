import Ember from 'ember';

const {
	filterBy,
	empty
} = Ember.computed;

export default Ember.Controller.extend({
	contactsController: Ember.inject.controller('main.contacts'),

	selected: filterBy('contactsController.contacts', 'isSelected', true),
	// can message when no shared with me select OR all
	// of the shared with me selected are DELEGATE permission
	selectedCanMessage: Ember.computed('selected', function() {
		return this.get('noSharedWithMeSelected') ||
			this.get('sharedWithMeSelected').every((contact) =>
				contact.get('isSharedDelegate'));
	}),
	sharedWithMeSelected: filterBy('selected', 'isShared', true),
	noSharedWithMeSelected: empty('sharedWithMeSelected'),

	actions: {
		selectAll: function() {
			this.get('contactsController.contacts').forEach((contact) => {
				contact.set('isSelected', true);
			});
		},
		selectAllMyContacts: function() {
			this.get('contactsController.contacts').forEach((contact) => {
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
		this.get('selected').forEach((contact) => {
			contact.set('isSelected', false);
		});
	},
	_exitMany: function() {
		if (this.get('stateManager.viewingTag')) {
			this.transitionToRoute('main.tag');
		} else {
			this.transitionToRoute('main.contacts');
		}
	},
});
