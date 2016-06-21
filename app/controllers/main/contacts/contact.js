import Ember from 'ember';
import callIfPresent from '../../../utils/call-if-present';

const {
	alias
} = Ember.computed;

export default Ember.Controller.extend({
	contact: null,

	// Computed properties
	// -------------------

	records: alias('contact.records'),
	totalNumRecords: Ember.computed('contact.totalNumRecords', {
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
		sendMessage: function(then = undefined) {
			this.set('isSendingText', true);
			this.set('isSendingTextError', false);
			this.get('dataHandler')
				.sendMessage(this.get('textContents'), this.get('contact'))
				.then(() => {
					this.set('isSendingTextError', false);
					this.set('textContents', null);
					callIfPresent(then);
				}, () => {
					this.set('isSendingTextError', true);
				})
				.finally(() => {
					this.set('isSendingText', false);
				});
		},
	},

	_loadMoreWhenReady: function(doResolve, doReject, tryNumber = 0) {
		if (!this.get('_isReady') && tryNumber < 3) {
			return Ember.run.later(this, this._loadMoreWhenReady,
				doResolve, doReject, tryNumber + 1, 500);
		}
		const query = Object.create(null),
			contact = this.get('contact'),
			records = this.get('records');
		// build query
		query.max = 20;
		query.contactId = contact.get('id');
		if (records.length) {
			query.offset = records.length;
		}
		// execute query
		this.store.query('record', query).then((results) => {
			this.set('totalNumRecords', results.get('meta.total'));
			doResolve();
		}, this.get('dataHandler').buildErrorHandler(doReject));
	}
});
