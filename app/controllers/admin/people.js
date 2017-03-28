import Ember from 'ember';

const {
	computed: {
		alias
	},
	run
} = Ember;

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

	filterPeopleByStatus: Ember.on('init', Ember.observer('people.[]', function() {
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
			const people = this.get('people');
			return this._loadMore()
				.then((results) => {
					run(() => {
						people.clear();
						people.pushObjects(results.toArray());
					});
				});
		},
		loadMore: function() {
			const people = this.get('people');
			return this._loadMore(people.length)
				.then((results) => {
					people.pushObjects(results.toArray());
				});
		},
	},

	_loadMore: function(offset = 0) {
		return new Ember.RSVP.Promise((resolve, reject) => {
			const query = Object.create(null),
				org = this.get('stateManager.ownerAsOrg'),
				team = this.get('team');
			query.status = this.get('statuses');
			query.offset = offset;
			if (team) {
				query.teamId = team.get('id');
			} else if (org) {
				query.organizationId = org.get('id');
			}
			this.store.query('staff', query).then((results) => {
				this.set('numPeople', results.get('meta.total'));
				resolve(results);
			}, this.get('dataHandler').buildErrorHandler(reject));
		});
	},
	_translateFilter: function(filter) {
		const options = {
			active: ['staff', 'admin'],
			admins: ['admin'],
			deactivated: ['blocked']
		};
		return filter ? options[filter.toLowerCase()] : options['active'];
	}
});