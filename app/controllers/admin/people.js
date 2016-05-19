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

	actions: {
		loadMore: function() {
			return new Ember.RSVP.Promise((resolve, reject) => {
				const query = Object.create(null),
					org = this.get('stateManager.ownerAsOrg'),
					team = this.get('team'),
					people = this.get('people');
				query.status = this._translateFilter(this.get('filter'));
				if (people.length) {
					query.offset = people.length;
				}
				if (team) {
					query.teamId = team.get('id');
				} else if (org) {
					query.organizationId = org.get('id');
				}
				this.store.query('staff', query).then((result) => {
					people.pushObjects(result.toArray());
					this.set('numPeople', result.get('meta.total'));
					resolve();
				}, this.get('dataHandler').buildErrorHandler(reject));
			});
		},
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
