import Ember from 'ember';

const {
	alias
} = Ember.computed;

export default Ember.Controller.extend({
	adminController: Ember.inject.controller('admin'),

	queryParams: ['filter'],
	filter: alias('adminController.filter'),

	people: alias('adminController.people'),
	numPeople: '--',
	team: null,


	// Computed properties
	// -------------------

	statuses: Ember.computed('filter', function() {
		return this._translateFilter(this.get('filter'));
	}),

	// Observers
	// ---------

	filterPeopleByStatus: Ember.on('init', Ember.observer('people', function() {
		const people = this.get('people');
		if (!people) {
			return;
		}
		const statuses = this.get('statuses'),
			hasStatus = people.filter((pers) => pers.isAnyStatus(statuses));
		// set people to with new array to trigger rebuild of infinite scroll
		this.set('people', hasStatus);
	})),

	actions: {
		refresh: function() {
			this.get('people').clear();
			return this._loadMore();
		},
		loadMore: function() {
			return this._loadMore();
		},
	},

	_loadMore: function() {
		return new Ember.RSVP.Promise((resolve, reject) => {
			const query = Object.create(null),
				org = this.get('stateManager.ownerAsOrg'),
				team = this.get('team'),
				people = this.get('people'),
				unfiltered = this.get('people');
			query.status = this.get('statuses');
			if (people.length) {
				query.offset = people.length;
			}
			if (team) {
				query.teamId = team.get('id');
			} else if (org) {
				query.organizationId = org.get('id');
			}
			this.store.query('staff', query).then((result) => {
				unfiltered.pushObjects(result.toArray());
				this.set('numPeople', result.get('meta.total'));
				resolve();
			}, this.get('dataHandler').buildErrorHandler(reject));
		});
	},
	_translateFilter: function(filter) {
		const options = {
			active: ['staff', 'admin'],
			admins: ['admin'],
			blocked: ['blocked']
		};
		return filter ? options[filter.toLowerCase()] : options['active'];
	}
});
