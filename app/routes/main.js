import Auth from '../mixins/auth-route';
import callIfPresent from '../utils/call-if-present';
import Ember from 'ember';
import Setup from '../mixins/setup-route';
import Slideout from '../mixins/slideout-route';

export default Ember.Route.extend(Slideout, Auth, Setup, {
	slideoutOutlet: 'details-slideout',

	// Events
	// ------

	beforeModel: function() {
		this._super(...arguments);
		const user = this.get('authManager.authUser');
		return user.get('isNone').then((isNone) => {
			const orgIsApproved = user.get('org.content.isApproved');
			if (isNone && orgIsApproved && user.get('isAdmin')) {
				this.transitionTo('admin');
			} else if (isNone || !orgIsApproved) {
				this.transitionTo('none');
			}
		});
	},
	serialize: function(model) {
		return {
			main_identifier: model.get('urlIdentifier')
		};
	},
	model: function(params) {
		const id = params.main_identifier,
			user = this.get('authManager.authUser');
		if (id === user.get('urlIdentifier')) {
			return user;
		} else {
			return user.get('teamsWithPhones').then((teams) => {
				const team = teams.findBy('urlIdentifier', id);
				if (team) {
					return team;
				} else if (user.get('isAdmin')) {
					this.transitionTo('admin');
				} else {
					this.get('authManager').logout();
				}
			});
		}
	},
	afterModel: function(model) {
		this.get('stateManager').set('owner', model);
	},
	setupController: function(controller, model) {
		this._super(...arguments);
		// unload contacts that might duplicate between different phones
		// because of sharing arrangements
		this.store.unloadAll('contact');
		// load list of staff members available to share with
		this._loadOtherStaff(model);
	},
	redirect: function(model, transition) {
		this._super(...arguments);
		if (transition.targetName === 'main.index') {
			this.transitionTo('main.contacts');
		}
	},

	// Actions
	// -------

	actions: {
		toggleSelected: function(contact) {
			if (!this.get('stateManager.viewingMany')) {
				if (this.get('stateManager.viewingTag')) {
					this.transitionTo('main.tag.many');
				} else {
					this.transitionTo('main.contacts.many');
				}
			}
			contact.toggleProperty('isSelected');
		},
		willTransition: function() {
			this.controller.set('_transitioning', true);
		},

		// Slideout
		// --------

		didTransition: function() {
			this._closeSlideout();
			// close account slideout and drawer after transition
			const accountSwitcher = this.controller.get('accountSwitcher'),
				slidingMenu = this.controller.get('slidingMenu');
			if (accountSwitcher) {
				accountSwitcher.actions.close();
			}
			if (slidingMenu) {
				slidingMenu.actions.close();
			}
			// see main.contacts controller for explanation
			this.controller.set('_transitioning', false);
			return true;
		},
		toggleDetailSlideout: function(name, context) {
			this._toggleSlideout(name, context);
		},
		openDetailSlideout: function(name, context) {
			this._openSlideout(name, context);
		},
		closeSlideout: function() {
			this._closeSlideout();
			return true;
		},
		closeAllSlideouts: function(then) {
			this.send('closeSlideout');
			callIfPresent(then);
		},

		// Contact
		// -------

		initializeNewContact: function() {
			this.controller.set('newContact', this.store.createRecord('contact'));
		},
		cleanNewContact: function() {
			// nullify newContact to avoid sortable numbers component setting
			// a copied version of the numbers array after the newContact is
			// rolled back (thus deleted) which triggers an error from ember data
			this.controller.set('newContact', null);
		},
		createContact: function(contact, then) {
			return this.get('dataHandler')
				.persist(contact)
				.then(() => {
					const contacts = this.controller.get('contacts');
					if (contacts) {
						contacts.unshiftObject(contact);
						// have to copy to trigger re-render on infinite scroll
						this.controller.set('contacts', Ember.copy(contacts));
					}
					callIfPresent(then);
				});
		},
		markUnread: function(data) {
			const contacts = Ember.isArray(data) ? data : [data];
			contacts.forEach((contact) => contact.markUnread());
			this._changeContactStatus(contacts);
		},
		markActive: function(data) {
			const contacts = Ember.isArray(data) ? data : [data];
			contacts.forEach((contact) => contact.markActive());
			this._changeContactStatus(contacts);
		},
		markArchived: function(data) {
			const contacts = Ember.isArray(data) ? data : [data];
			contacts.forEach((contact) => contact.markArchived());
			this._changeContactStatus(contacts);
		},
		markBlocked: function(data) {
			const contacts = Ember.isArray(data) ? data : [data];
			contacts.forEach((contact) => contact.markBlocked());
			this._changeContactStatus(contacts);
		},

		// Tag
		// ---

		initializeNewTag: function() {
			this.controller.set('newTag', this.store.createRecord('tag'));
		},
		createTag: function(tag, then = undefined) {
			return this.get('dataHandler')
				.persist(tag)
				.then(() => {
					const model = this.get('currentModel');
					model.get('phone').then((phone) => {
						phone.get('tags').then((tags) => tags.pushObject(tag));
					});
					callIfPresent(then);
				});
		},
		updateTagMemberships: function(tags, contact, then = undefined) {
			const contacts = Ember.isArray(contact) ? contact : [contact];
			return this.get('dataHandler')
				.persist(tags)
				.then(() => {
					const promises = contacts.map((contact) => contact.reload());
					Ember.RSVP.all(promises).then(() => {
						callIfPresent(then);
					}, this.get('dataHandler').buildErrorHandler());
				});
		},

		// Compose
		// -------

		composeWithRecipients: function(data) {
			this.controller.set('selectedRecipients', Ember.copy(data));
			this.send('openSlideout', 'slideouts/compose', 'main');
		},
		initializeCompose: function() {
			const recipients = this.controller.get('selectedRecipients');
			if (!recipients) {
				this.controller.set('selectedRecipients', []);
			}
			this.controller.set('composeMessage', '');
		},
		cleanCompose: function() {
			this.controller.set('composeMessage', null);
			this.controller.set('selectedRecipients', []);
		},

		// Communications
		// --------------

		sendMessage: function(msg, recipients, then = undefined) {
			return this.get('dataHandler')
				.sendMessage(msg, recipients)
				.then(() => {
					this.notifications.success('Message successfully sent.');
					callIfPresent(then);
				});
		},
		makeCall: function(recipient, then = undefined) {
			return this.get('dataHandler')
				.makeCall(recipient)
				.then(() => {
					this.notifications.success('Successfully started call.');
					callIfPresent(then);
				});
		},
	},

	// Helpers
	// -------

	_changeContactStatus: function(contacts) {
		this.get('dataHandler')
			.persist(contacts)
			.then((updatedContacts) => {
				this.controller.notifyPropertyChange('contacts');
				updatedContacts.forEach((cont) => cont.set('isSelected', false));
			});
	},
	_loadOtherStaff: function(model) {
		const shareQuery = Object.create(null);
		shareQuery.max = 100;
		if (model.get('constructor.modelName') === 'team') {
			shareQuery.teamId = model.get('id');
		} else {
			shareQuery.canShareStaffId = model.get('id');
		}
		this.store.query('staff', shareQuery).then((result) => {
			this.get('stateManager').set('relevantStaffs', result.toArray());
		}, this.get('dataHandler').buildErrorHandler());
	},
});
