import Ember from 'ember';
import GroupByBucket from './group-by-bucket';

export default GroupByBucket.extend({
	layoutName: 'components/multi-toggle/group-by-bucket',

	clearActions: function(bucket) {
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
	},
	doActions: function(bucket, command) {
		this.clearActions(bucket);
		const items = this.get('itemList'),
			actionProperty = this.get('actionProperty');
		items.forEach(function(item) {
			const actions = Ember.get(item, actionProperty) || [];
			actions.pushObject(this._makeAction(bucket, item, command));
			Ember.set(item, actionProperty, actions);
		}.bind(this));
	}
});
