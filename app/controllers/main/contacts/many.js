import Ember from 'ember';

const {
	filterBy,
	alias,
	readOnly,
	empty
} = Ember.computed;

export default Ember.Controller.extend({
	mainController: Ember.inject.controller('main'),
	contactsController: Ember.inject.controller('main.contacts'),

	viewingTag: readOnly('mainController.viewingTag'),
	shareCandidates: readOnly('mainController.shareCandidates'),
	mainModel: readOnly('mainController.model'),

	selected: filterBy('contactsController.contacts', 'isSelected', true),
	sharedWithMeSelected: filterBy('selected', 'isShared', true),

	noSharedWithMeSelected: empty('sharedWithMeSelected'),
	// can message when no shared with me select OR all
	// of the shared with me selected are DELEGATE permission
	selectedCanMessage: Ember.computed('selected', function() {
		return this.get('noSharedWithMeSelected') ||
			this.get('sharedWithMeSelected').every((contact) =>
				contact.get('isSharedDelegate'));
	}),


	actions: {
		selectAll: function() {
			this.get('contactsController.contacts').map((contact) => {
				contact.set('isSelected', true);
			});
		},
		selectAllMyContacts: function() {
			this.get('contactsController.contacts').map((contact) => {
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
		this.get('selected').map((contact) => {
			contact.set('isSelected', false);
		});
	},
	_exitMany: function() {
		if (this.get('viewingTag')) {
			this.transitionToRoute('main.tag');
		} else {
			this.transitionToRoute('main.contacts');
		}
	},
});
