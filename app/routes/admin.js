import Auth from '../mixins/auth-route';
import Ember from 'ember';
import Slideout from '../mixins/slideout-route';
import callIfPresent from '../utils/call-if-present';
import randomstring from 'npm:randomstring';

export default Ember.Route.extend(Slideout, Auth, {
	slideoutOutlet: 'details-slideout',

	beforeModel: function() {
		this._super(...arguments);
		if (!this.get('authManager.authUser.isAdmin')) {
			this.transitionTo('main');
		}
	},
	model: function() {
		return this.get('authManager.authUser.org');
	},
	afterModel: function(org) {
		this.get('stateManager').set('owner', org);
	},
	setupController: function(controller, org) {
		this._super(...arguments);
		this._loadPending(org);
	},
	redirect: function(model, transition) {
		if (transition.targetName === 'admin.index') {
			this.transitionTo('admin.people');
		}
	},

	actions: {

		// Slideout
		// ---------

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

		// Staff
		// -----

		initializeNewStaff: function() {
			this.controller.set('newStaff', this.store.createRecord('staff', {
				org: this.get('currentModel'),
				status: 'STAFF',
				password: randomstring.generate({
					length: 12,
					readable: true,
					charset: 'alphanumeric'
				})
			}));
		},
		cleanNewStaff: function(staff, then = undefined) {
			// set to false to prevent adding new phone toggle
			// from showing true when reinitializing this slideout
			// after it is closed with with addNewPhone set to true
			staff.set('addNewPhone', false);
			callIfPresent(then);
		},
		createStaff: function(staff, then = undefined) {
			this.get('dataHandler')
				.persist(staff)
				.then(() => {
					const people = this.controller.get('people');
					if (people) {
						people.unshiftObject(staff);
						this.controller.set('people', Ember.copy(people));
					}
					callIfPresent(then);
				});
		},

		// Team
		// ----

		initializeNewTeam: function() {
			this.controller.set('newTeam', this.store.createRecord('team'));
		},
		createTeam: function(team, then = undefined) {
			this.get('dataHandler')
				.persist(team)
				.then(() => {
					const model = this.get('currentModel');
					model.get('teams').then((teams) => teams.pushObject(team));
					callIfPresent(then);
				});
		},
		updateTeamMemberships: function(teams, person, then = undefined) {
			const people = Ember.isArray(person) ? person : [person];
			this.get('dataHandler')
				.persist(teams)
				.then(() => {
					const promises = people.map((person) => person.reload());
					Ember.RSVP.all(promises).then(() => {
						callIfPresent(then);
					}, this.get('dataHandler').buildErrorHandler());
				});
		}
	},

	_loadPending: function(org) {
		this.store.query('staff', {
			organizationId: org.get('id'),
			status: ['pending']
		}).then((success) => {
			this.controller.set('pending', success.toArray());
			this.controller.set('numPending', success.get('meta.total'));
		}, this.get('dataHandler').buildErrorHandler());
	}
});
