import Ember from 'ember';
import callIfPresent from '../../../utils/call-if-present';

const {
	alias
} = Ember.computed;

export default Ember.Controller.extend({
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
	contact: null,

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
				const query = Object.create(null),
					contact = this.get('contact'),
					records = this.get('records');
				// build query
				query.contactId = contact.get('id');
				if (records.length) {
					query.offset = records.length;
				}
				// execute query
				this.store.query('record', query).then((results) => {
					this.set('totalNumRecords', results.get('meta.total'));
					resolve();
				}, this.get('dataHandler').buildErrorHandler(reject));
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
});
