import Ember from 'ember';
import defaultIfAbsent from '../../utils/default-if-absent';

export default Ember.Component.extend({

	itemIdentityProperty: defaultIfAbsent('id'),
	itemBucketProperty: defaultIfAbsent('buckets'),
	// if specified, then the value stored in bucket memberships will
	// be the value at that property. When determining if an option should
	// be selected, the COMMAND of the option must equal to the value stored
	// in bucket memberships
	itemBucketCommandProperty: null,
	items: defaultIfAbsent([]),

	// the property name must match in the item list and on the bucket
	// ex: if staff is bucket and contact is item, then this property name
	// must be the same on the staff as it is on the sharedWith list
	// on the contact
	bucketIdentityProperty: defaultIfAbsent('name'),
	buckets: defaultIfAbsent([]),

	// the property name that the actions array will be stored under
	actionProperty: defaultIfAbsent('actions'),
	wraparound: defaultIfAbsent(true),

	singleOptions: defaultIfAbsent([{
		display: 'No',
		command: 'REMOVE',
		color: '#c9302c'
	}, {
		showWhenSelected: true,
		display: 'Yes',
		command: 'ADD',
		color: '#56a556'
	}]),
	multipleOptions: defaultIfAbsent([{
		display: 'None',
		command: 'REMOVE',
		color: '#c9302c'
	}, {
		display: 'All',
		command: 'ADD',
		color: '#56a556'
	}]),
	noChangeLabel: defaultIfAbsent('No Change'),
	noChangeColor: defaultIfAbsent('#d3d3d3'),

	noBucketsLabel: defaultIfAbsent('No buckets yet.'),

	_actionBucketIdProp: 'bucketId',
	_actionItemIdProp: 'itemId',
	_actionCommandProp: 'action',

	// Computed properties
	// -------------------

	itemList: Ember.computed('items', function() {
		const items = this.get('items');
		return Ember.isArray(items) ? items : [items];
	}),
	hasManyItems: Ember.computed('itemList', function() {
		return this.get('itemList.length') > 1;
	}),
	firstItemBucketMemberships: Ember.computed('buckets', 'itemList', 'hasManyItems',
		function() {
			const memberships = Object.create(null);
			if (this.get('hasManyItems')) {
				return memberships;
			}
			const bucketIdProp = this.get('bucketIdentityProperty'),
				itemBuckets = this.get('itemBucketProperty'),
				itemCommandProp = this.get('itemBucketCommandProperty'),
				existingBuckets = this.get(`itemList.firstObject.${itemBuckets}`);
			existingBuckets.forEach(function(itemBucket) {
				// store value at item command property if specified,
				// otherwise, just store true
				const value = itemCommandProp ? Ember.get(itemBucket, itemCommandProp) : true;
				Ember.set(memberships, String(Ember.get(itemBucket, bucketIdProp)), value);
			}.bind(this));
			return memberships;
		}),

	// Actions
	// -------

	actions: {
		clearActions: function(bucket) {
			this.clearActions(bucket);
		},
		doActions: function(bucket, command) {
			this.doActions(bucket, command);
		}
	},

	// Helpers
	// -------

	clearActions: function(bucket) {
		const prop = this.get('actionProperty'),
			actions = Ember.get(bucket, prop);
		if (Ember.isArray(actions)) {
			actions.clear();
		} else {
			Ember.set(bucket, prop, []);
		}
	},
	doActions: function(bucket, command) {
		this.clearActions(bucket);
		const prop = this.get('actionProperty'),
			actions = Ember.get(bucket, prop);
		this.get('itemList').forEach(function(item) {
			actions.pushObject(this._makeAction(bucket, item, command));
		}.bind(this));
		Ember.set(bucket, prop, actions);
	},
	_makeAction: function(bucket, item, command) {
		const itemIdProp = this.get('itemIdentityProperty'),
			bucketIdProp = this.get('bucketIdentityProperty'),
			action = Object.create(null);
		action[this.get('_actionBucketIdProp')] = Ember.get(bucket, bucketIdProp);
		action[this.get('_actionItemIdProp')] = Ember.get(item, itemIdProp);
		action[this.get('_actionCommandProp')] = command;
		return action;
	},
});
