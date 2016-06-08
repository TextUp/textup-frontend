import Ember from 'ember';

const {
	alias
} = Ember.computed;

export default Ember.Controller.extend({
	mainController: Ember.inject.controller('main'),

	queryParams: ['filter'],
	// alias the filter property of main for displaying active menu items
	filter: alias('mainController.filter'),
	// store contacts on mainController so we can add new contacts for display
	contacts: alias('mainController.contacts'),

	// contacts array on mainController is an alias of the owner's contacts
	// so when we are switching to admin, we are changing owner and switching to
	// an owner that doesn't have contacts becuase owner is now an organization
	_transitioning: alias('mainController._transitioning'),

	numContacts: '--',
	tag: null,

	// Computed properties
	// -------------------

	statuses: Ember.computed('filter', function() {
		return this._translateFilter(this.get('filter'));
	}),

	// Observers
	// ---------

	filterContactsByStatus: Ember.on('init', Ember.observer('contacts', function() {
		const contacts = this.get('contacts');
		if (!contacts) {
			return;
		}
		const statuses = this.get('statuses'),
			hasStatus = contacts.filter((cont) => cont.isAnyStatus(statuses));
		// set contacts to with new array to trigger rebuild of infinite scroll
		this.set('contacts', hasStatus);
	})),

	actions: {
		refresh: function() {
			this.get('contacts').clear();
			return this._loadMore();
		},
		loadMore: function() {
			return this._loadMore();
		},
	},

	_loadMore: function() {
		return new Ember.RSVP.Promise((resolve, reject) => {
			if (this.get('_transitioning')) {
				return resolve();
			}
			const query = Object.create(null),
				team = this.get('stateManager.ownerAsTeam'),
				tag = this.get('tag'),
				contacts = this.get('contacts');
			// build query
			query.status = this.get('statuses');
			if (contacts.length) {
				query.offset = contacts.length;
			}
			if (tag) { // one or the other, can't be both
				query.tagId = tag.get('id');
			} else if (team) {
				query.teamId = team.get('id');
			}
			// execute query
			this.store.query('contact', query).then((results) => {
				contacts.pushObjects(results.toArray());
				this.set('numContacts', results.get('meta.total'));
				resolve();
			}, this.get('dataHandler').buildErrorHandler(reject));
		});
	},
	_translateFilter: function(filter) {
		const options = {
			all: ['unread', 'active'],
			unread: ['unread'],
			archived: ['archived'],
			blocked: ['blocked']
		};
		return filter ? options[filter.toLowerCase()] : options['all'];
	}
});
