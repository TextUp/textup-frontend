import Ember from 'ember';

const {
	alias,
	readOnly
} = Ember.computed;

export default Ember.Controller.extend({
	mainController: Ember.inject.controller('main'),

	mainModel: readOnly('mainController.model'),

	queryParams: ['filter'],
	// alias the filter property of main for displaying active menu items
	filter: alias('mainController.filter'),

	numContacts: '--',
	contacts: alias('mainController.contacts'),
	tag: null,

	actions: {
		loadMore: function() {
			return new Ember.RSVP.Promise((resolve, reject) => {
				const query = Object.create(null),
					main = this.get('mainModel'),
					tag = this.get('tag'),
					contacts = this.get('contacts');
				// build query
				query.status = this._translateFilter(this.get('filter'));
				if (contacts.length) {
					query.offset = contacts.length;
				}
				if (tag) { // one or the other, can't be both
					query.tagId = tag.get('id');
				} else if (main.get('constructor.modelName') === 'team') {
					query.teamId = main.get('id');
				}
				// execute query
				this.store.query('contact', query).then((results) => {
					contacts.pushObjects(results.toArray());
					this.set('numContacts', results.get('meta.total'));
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
