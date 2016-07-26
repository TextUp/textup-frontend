import Ember from 'ember';

const {
	alias
} = Ember.computed;

export default Ember.Controller.extend({
	tag: null,

	// Computed properties
	// -------------------

	futureMsgs: alias('tag.sortedFutureMessages'),
	records: alias('tag.records'),
	totalNumRecords: alias('tag.totalNumRecords'),

	actions: {
		refresh: function() {
			return new Ember.RSVP.Promise((resolve, reject) => {
				this.store.query('record', {
					tagId: this.get('tag.id')
				}).then((results) => {
					this.set('totalNumRecords', results.get('meta.total'));
					resolve();
				}, this.get('dataHandler').buildErrorHandler(reject));
			});
		},
		loadMore: function() {
			return new Ember.RSVP.Promise((resolve, reject) => {
				this._loadMoreWhenReady(resolve, reject);
			});
		},
	},

	_loadMoreWhenReady: function(doResolve, doReject) {
		const query = Object.create(null),
			tag = this.get('tag'),
			records = this.get('records');
		// build query
		query.max = 20;
		query.tagId = tag.get('id');
		if (records && records.length) {
			query.offset = records.length;
		}
		// execute query
		this.store.query('record', query).then((results) => {
			this.set('totalNumRecords', results.get('meta.total'));
			doResolve();
		}, this.get('dataHandler').buildErrorHandler(doReject));
	}
});
