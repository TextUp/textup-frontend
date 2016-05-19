import Ember from 'ember';
import GroupByBucket from './group-by-bucket';

export default GroupByBucket.extend({
	layoutName: 'components/multi-toggle/group-by-bucket',

	clearActions: function(bucket, determineChanges = true) {
		const items = this.get('itemList'),
			actionProperty = this.get('actionProperty'),
			bucketIdProp = this.get('bucketIdentityProperty'),
			actionBucketIdProp = this.get('_actionBucketIdProp'),
			currentBucketIdString = String(Ember.get(bucket, bucketIdProp));
		items.forEach(function(item) {
			const actions = Ember.get(item, actionProperty) || [],
				foundAction = actions.find(function(action) {
					const actionBucketId = Ember.get(action, actionBucketIdProp);
					return String(actionBucketId) === currentBucketIdString;
				});
			if (Ember.isPresent(foundAction)) {
				actions.removeObject(foundAction);
			}
			Ember.set(item, actionProperty, actions);
		});
		if (determineChanges) {
			this._determineAnyChanges();
		}
	},
	doActions: function(bucket, command) {
		this.clearActions(bucket, false);
		const items = this.get('itemList'),
			actionProperty = this.get('actionProperty');
		items.forEach(function(item) {
			const actions = Ember.get(item, actionProperty) || [];
			actions.pushObject(this._makeAction(bucket, item, command));
			Ember.set(item, actionProperty, actions);
		}.bind(this));
		this.set('anyChanges', true);
	},
	_determineAnyChanges: function() {
		const prop = this.get('actionProperty'),
			anyChanges = this.get('itemList').any((item) => {
				const actions = Ember.get(item, prop);
				return actions && actions.length > 0;
			});
		this.set('anyChanges', anyChanges);
		return anyChanges;
	},
});
