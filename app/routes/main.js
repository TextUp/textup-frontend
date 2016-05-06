import Auth from '../mixins/auth-route';
import Ember from 'ember';
import Slideout from '../mixins/slideout-route';

export default Ember.Route.extend(Slideout, Auth, {
	slideoutOutlet: 'details-slideout',

	// Events
	// ------

	beforeModel: function() {
		this._super(...arguments);
		const user = this.get('authManager.authUser');

		console.log("MAIN BEFORE MODEL HOOK!");

		if (user.get('isAdmin')) {
			this.transitionTo('admin');
		} else {
			return user.get('isNone').then((isNone) => {
				if (isNone) {
					this.transitionTo('none');
				}
			});
		}
	},
	serialize: function(model) {
		return {
			main_identifier: model.get('urlIdentifier')
		};
	},
	model: function(params, transition) {
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

					transition.send('logout');
				}
			});
		}
	},
	setupController: function(controller, model) {
		this._super(...arguments);
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
			const appController = this.controllerFor('application'),
				currentPath = appController.get('currentPath');
			if (currentPath !== 'main.contacts.many' &&
				currentPath !== 'main.tag.many') {
				if (this.controller.get('viewingTag')) {
					this.transitionTo('main.tag.many');
				} else {
					this.transitionTo('main.contacts.many');
				}
			}
			contact.toggleProperty('isSelected');
		},
		willTransition: function() {
			this.controller.setProperties({
				newContact: null,
				selectedRecipients: [],
				composeMessage: ''
			});
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
		toggleSlideout: function() {
			this._doSlideoutSetup(...arguments);
			return true;
		},
		openSlideout: function() {
			this._doSlideoutSetup(...arguments);
			return true;
		},
		closeSlideout: function() {
			this._closeSlideout();
			this.controller.setProperties({
				selectedRecipients: [],
				composeMessage: ''
			});
			return true;
		},
		revertAndClose: function(model) {
			model.rollbackAttributes();
			this.send('closeSlideout');
		},
		closeIfSuccess: function(model) {
			const changed = model.changedAttributes();
			if (changed) {
				this.get('dataHandler')
					.persist(model)
					.then(this.send.bind(this, 'closeSlideout'));
			} else {
				this.send('closeSlideout');
			}
		},

		// Account
		// -------

		updateStaff: function() {
			console.log('updateStaff');
			return false;
		},

		// Create contact
		// --------------

		createContact: function(data) {
			const numbers = Ember.get(data, 'numbers');
			if (numbers && numbers.length > 0) {
				const contact = this.store.createRecord('contact', data);
				this.get('dataHandler')
					.persist(contact)
					.then(() => {
						const contacts = this.controller.get('contacts');
						if (contacts) {
							contacts.unshiftObject(contact);
							// have to copy to trigger re-render on infinite scroll
							this.controller.set('contacts', Ember.copy(contacts));
						}
						this.send('closeSlideout');
					}, contact.rollbackAttributes.bind(contact));
			} else {
				this.notifications.error('Contact must have at least 1 number');
			}
		},

		// Compose
		// -------

		sendMessage: function() {
			console.log("SEND MESSAGE!");
		},
	},

	// Methods
	// -------

	_doSlideoutSetup: function(name, context, data = undefined) {
		if (name === 'slideouts/contact' && context === 'main') {
			this.controller.set('newContact', {
				numbers: [] // need to initialize the array
			});
		} else if (name === 'slideouts/compose' && context === 'main' &&
			Ember.isPresent(data)) {
			this.controller.set('selectedRecipients', Ember.copy(Ember.A(data)));
		}
	},
	_loadOtherStaff: function(model) {
		const shareQuery = Object.create(null),
			isTeam = model.get('constructor.modelName') === 'team',
			user = this.get('authManager.authUser');
		shareQuery.max = 100;
		if (isTeam) {
			shareQuery.teamId = model.get('id');
		} else {
			shareQuery.canShareStaffId = model.get('id');
		}
		this.store.query('staff', shareQuery).then((result) => {
			const staffs = result.toArray().filter((staff) => {
				return staff.get('id') !== user.get('id');
			});
			// team members might not have a phone!
			if (isTeam) {
				this.controller.set('teamMembers', staffs);
			}
			// share candidates must have a phone!
			this.controller.set('shareCandidates',
				staffs.filter((staff) => staff.get('phone')));

		});
	},
});
