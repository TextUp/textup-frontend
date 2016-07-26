import Ember from 'ember';

const {
	computed,
	computed: {
		alias
	}
} = Ember;

export default Ember.Controller.extend({

	contact: null,
	newFutureMsg: null,

	// Computed properties
	// -------------------

	futureMsgs: alias('contact.sortedFutureMessages'),
	records: alias('contact.records'),
	totalNumRecords: computed('contact.totalNumRecords', {
		get: function() {
			return this.get('_isReady') ? this.get('contact.totalNumRecords') : '--';
		},
		set: function(key, value) {
			if (this.get('_isReady')) {
				this.set('contact.totalNumRecords', value);
			}
			return value;
		}
	}),

	actions: {
		refresh: function() {
			return new Ember.RSVP.Promise((resolve, reject) => {
				this.store.query('record', {
					contactId: this.get('contact.id')
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

	_loadMoreWhenReady: function(doResolve, doReject, tryNumber = 0) {
		// wait a bit more before trying to send a request if we are
		// not yet ready (that is, done reloading the contact that has been
		// mysteriously invalidated by ember data) or the contact's id is undefined
		const contact = this.get('contact');
		if ((!contact.get('id') || !this.get('_isReady')) && tryNumber < 3) {
			return Ember.run.later(this, this._loadMoreWhenReady,
				doResolve, doReject, tryNumber + 1, 500);
		}
		const query = Object.create(null),
			records = this.get('records');
		// build query
		query.max = 20;
		query.contactId = contact.get('id');
		if (records && records.length) {
			query.offset = records.length;
		}
		// if contact id is null, then we want to silently fail to avoid presenting
		// a distressing error message to the user. Infinite scroll component should
		// re-request records anyways so the records will show up regardless so
		// there's no need to present this error message
		const onReject = query.contactId ?
			this.get('dataHandler').buildErrorHandler(doReject) : null;
		// execute query
		this.store.query('record', query).then((results) => {
			this.set('totalNumRecords', results.get('meta.total'));
			doResolve();
		}, onReject);
	}
});
