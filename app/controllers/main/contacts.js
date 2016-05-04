import Ember from 'ember';

export default Ember.Controller.extend({
	mainController: Ember.inject.controller('main'),
	queryParams: ['filter'],
	// alias the filter property of main for displaying active menu items
	filter: Ember.computed.alias('mainController.filter'),

	numContacts: '--',
	contacts: [],
	tag: null,

	actions: {
		loadMore: function() {
			return new Ember.RSVP.Promise((resolve, reject) => {
				const query = Object.create(null),
					main = this.get('mainModel'),
					tag = this.get('tag');
				// build query
				query.status = this._translateFilter(this.get('filter'));
				if (tag) {
					query.tagId = tag.get('id');
				}
				if (main.get('constructor.modelName') === 'team') {
					query.teamId = main.get('id');
				}
				// execute query
				this.store.query('contact', query).then((contacts) => {
					this.get('contacts').pushObjects(contacts.toArray());
					this.set('numContacts', contacts.get('meta.total'));
					resolve();
				}, reject);
			});
		},
	},

	_translateFilter: function(filter) {
		const options = {
			all: ['unread', 'active'],
			unread: ['unread'],
			sharedByMe: ['sharedByMe'],
			sharedWithMe: ['sharedWithMe'],
			archived: ['archived'],
			blocked: ['blocked']
		};
		return filter ? options[filter.toLowerCase()] : options['all'];
	}
});
