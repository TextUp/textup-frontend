import DS from 'ember-data';
import Ember from 'ember';
import uniqBy from '../utils/uniq-by';

const {
	computed,
	computed: {
		sort
	},
	RSVP: {
		Promise
	}
} = Ember;

export default Ember.Mixin.create({

	// Attributes
	// ----------

	futureMessages: DS.hasMany('future-message'),
	uniqueFutureMessages: uniqBy('futureMessages', 'id'),
	futureMessagesSorting: ['nextFireDate:asc'],
	sortedFutureMessages: sort('uniqueFutureMessages', 'futureMessagesSorting'),

	// Computed properties
	// -------------------

	hasFutureMsgs: computed('futureMessages.[]', function() {
		// promise array proxies property calls onto underlying array, and will
		// return zero until fulfilled, when it returns the true length
		return !!this.get('futureMessages.length');
	}),
	nextFutureFire: computed('futureMessages.@each.nextFireDate',
		'futureMessages.@each.isDone',
		function() {
			return DS.PromiseObject.create({
				promise: this.get('futureMessages').then((fMsgs) => {
					return fMsgs.reduce((prev, fMsg) => {
						if (fMsg.get('isDone')) {
							return prev;
						} else {
							const val = fMsg.get('nextFireDate');
							return (!prev || val.getTime() < prev.getTime()) ? val : prev;
						}
					}, null);
				})
			});
		}),

	// Public methods
	// --------------

	// sometimes, after creating a new future message, we have duplicates of
	// new future message. We can call this method to remove the duplicate
	// so that if we need to delete a future message, the item will disappear
	// from the app and won't have a duplicate copy persisting in the app
	findDuplicateFutureMessages: function() {
		return new Promise((resolve, reject) => {
			this.get('futureMessages').then((fMsgs) => {
				const fIds = Object.create(null),
					duplicates = [];
				fMsgs.forEach((fMsg) => {
					const fId = fMsg.get('id');
					if (fIds[fId]) {
						duplicates.pushObject(fMsg);
					}
					fIds[fId] = true;
				});
				resolve(duplicates);
			}, reject);
		});
	},
});