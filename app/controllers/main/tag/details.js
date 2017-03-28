import Ember from 'ember';

const {
	alias
} = Ember.computed;

export default Ember.Controller.extend({

	tag: null,
	newFutureMsg: null,

	recordItemToInsertAfter: null,
	recordNote: null,

	// Computed properties
	// -------------------

	futureMsgs: alias('tag.sortedFutureMessages'),
	records: alias('tag.records'),
	recordsAdjustedSize: alias('tag.recordsAdjustedSize'),
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
			adjustedSize = this.get('recordsAdjustedSize');
		// build query
		query.max = 20;
		query.tagId = tag.get('id');
		if (adjustedSize) {
			query.offset = adjustedSize;
		}
		// execute query
		this.store.query('record', query).then((results) => {
			this.set('totalNumRecords', results.get('meta.total'));
			doResolve();
		}, this.get('dataHandler').buildErrorHandler(doReject));
	}
});