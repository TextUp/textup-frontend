import Ember from 'ember';

export default Ember.Controller.extend({
	records: [],
	totalNumRecords: '--',
	contact: null,

	actions: {
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
					records.pushObjects(results.toArray());
					this.set('totalNumRecords', results.get('meta.total'));
					resolve();
				}, this.get('dataHandler').buildErrorHandler(reject));
			});
		},
	},
});
