import Auth from '../mixins/auth-route';
import Ember from 'ember';
import Slideout from '../mixins/slideout-route';
import callIfPresent from '../utils/call-if-present';

export default Ember.Route.extend(Slideout, Auth, {
	slideoutOutlet: 'details-slideout',

	// Events
	// ------

	beforeModel: function() {
		this._super(...arguments);
		const user = this.get('authManager.authUser');

		console.log("MAIN BEFORE MODEL HOOK!");

		return user.get('isNone').then((isNone) => {
			if (isNone) {
				if (user.get('isAdmin')) {
					this.transitionTo('admin');
				} else {
					this.transitionTo('none');
				}
			}
		});
	},
	serialize: function(model) {
		console.log('main route serialize: model');
		console.log(model);

		return {
			main_identifier: model.get('urlIdentifier')
		};
	},
	model: function(params) {
		console.log("MAIN MODEL HOOK!");

		const id = params.main_identifier,
			user = this.get('authManager.authUser');
		if (id === user.get('urlIdentifier')) {

			console.log("main model branch 1");

			return user;
		} else {
			return user.get('teamsWithPhones').then((teams) => {
				const team = teams.findBy('urlIdentifier', id);
				if (team) {

					console.log("main model branch 2");

					return team;
				} else if (user.get('isAdmin')) {

					console.log("main model branch 3");

					this.transitionTo('admin');
				} else {

					console.log("main model branch 4");

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

		// Slideout
		// --------

		didTransition: function() {
			this._closeSlideout();
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
			this.get('dataHandler')
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

		// Tag
		// ---

		initializeNewTag: function() {
			this.controller.set('newTag', this.store.createRecord('tag'));
		},
		createTag: function(tag, then = undefined) {
			this.get('dataHandler')
				.persist(tag)
				.then(() => {
					const model = this.get('currentModel');
					model.get('tags').then((tags) => tags.pushObject(tag));
					callIfPresent(then);
				});
		},
		updateTagMemberships: function(tags, contact, then = undefined) {
			const contacts = Ember.isArray(contact) ? contact : [contact];
			this.get('dataHandler')
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
			console.log('initializeCompose');

			const recipients = this.controller.get('selectedRecipients');
			if (!recipients) {
				console.log("OVERWRITING selectedRecipients");
				this.controller.set('selectedRecipients', []);
			}
			this.controller.set('composeMessage', '');
		},
		cleanCompose: function() {
			console.log('cleanCompose');

			this.controller.set('selectedRecipients', []);
		},
		sendMessage: function() {
			console.log("SEND MESSAGE!");
		},
	},

	// Helpers
	// -------

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
