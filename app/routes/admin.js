import Auth from '../mixins/auth-route';
import callIfPresent from '../utils/call-if-present';
import Ember from 'ember';
import randomstring from 'npm:randomstring';
import Setup from '../mixins/setup-route';
import Slideout from '../mixins/slideout-route';

const {
	get
} = Ember;

export default Ember.Route.extend(Slideout, Auth, Setup, {
	slideoutOutlet: 'details-slideout',

	beforeModel: function() {
		this._super(...arguments);
		const user = this.get('authManager.authUser');
		return user.get('org').then((org) => {
			if (!org.get('isApproved')) {
				this.transitionTo('none');
			} else if (!user.get('isAdmin')) {
				this.transitionTo('main', user);
			}
		});
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
		this._super(...arguments);
		if (transition.targetName === 'admin.index') {
			this.transitionTo('admin.people');
		}
	},

	actions: {
		toggleSelected: function(staff) {
			if (!this.get('stateManager.viewingMany')) {
				if (this.get('stateManager.viewingTeam')) {
					this.transitionTo('admin.team.many');
				} else {
					this.transitionTo('admin.people.many');
				}
			}
			staff.toggleProperty('isSelected');
		},

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
			// after it is closed with with phoneAction set to true
			staff.set('phoneAction', null);
			callIfPresent(then);
		},
		createStaff: function(staff, then = undefined) {
			return this.get('dataHandler')
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
		markStaff: function(data) {
			const people = Ember.isArray(data) ? data : [data];
			people.forEach((person) => person.makeStaff());
			this._changeStaffStatus(people);
		},
		markAdmin: function(data) {
			const people = Ember.isArray(data) ? data : [data];
			people.forEach((person) => person.makeAdmin());
			this._changeStaffStatus(people);
		},
		markBlocked: function(data) {
			const people = Ember.isArray(data) ? data : [data];
			people.forEach((person) => person.block());
			this._changeStaffStatus(people);
		},

		// Team
		// ----

		initializeNewTeam: function() {
			this.controller.set('newTeam', this.store.createRecord('team', {
				org: this.get('currentModel'),
				location: this.store.createRecord('location')
			}));
		},
		createTeam: function(team, then = undefined) {
			return this.get('dataHandler')
				.persist(team)
				.then(() => {
					// there's a zombie location record that persists, but we
					// are leaving it in the store because unloading the zombie
					// location also disassociates the team and its location
					const model = this.get('currentModel');
					model.get('teams').then((teams) => teams.unshiftObject(team));
					callIfPresent(then);
				});
		},
		updateTeamMemberships: function(teams, person, then = undefined) {
			const people = Ember.isArray(person) ? person : [person];
			return this.get('dataHandler')
				.persist(teams)
				.then(() => {
					const promises = people.map((person) => person.reload());
					Ember.RSVP.all(promises).then(() => {
						callIfPresent(then);
					}, this.get('dataHandler').buildErrorHandler());
				});
		},
		deleteTeam: function(team, then = undefined) {
			const loc = team.get('location.content'),
				data = this.get('dataHandler');
			data.markForDelete(team);
			return data.persist(team).then(() => {
				this.store.unloadRecord(loc);
				callIfPresent(then);
			});
		},

		// Phone
		// -----

		persistWithPhone: function(withPhone, then) {
			const isTransfer = (withPhone.get('phoneAction') === 'transfer'),
				data = withPhone.get('phoneActionData'),
				targetId = isTransfer ? get(data, 'id') : null;
			const targetClass = isTransfer ?
				this._getModelNameFromType(get(data, 'type')) : null;
			return this.get('dataHandler')
				.persist(withPhone)
				.then(() => {
					if (targetId && targetClass) {
						return this.store.findRecord(targetClass, targetId, {
							reload: true
						}).then(() => callIfPresent(then));
					} else {
						callIfPresent(then);
					}
				});
		}
	},

	// Helpers
	// -------

	_getModelNameFromType: function(type) {
		return String(type).toLowerCase() === 'group' ? 'team' : 'staff';
	},
	_changeStaffStatus: function(people) {
		this.get('dataHandler')
			.persist(people)
			.then((updatedPeople) => {
				this.controller.notifyPropertyChange('people');
				updatedPeople.forEach((per) => per.set('isSelected', false));
			});
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
