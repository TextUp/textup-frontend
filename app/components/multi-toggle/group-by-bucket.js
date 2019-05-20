import { scheduleOnce } from '@ember/runloop';
import { isArray } from '@ember/array';
import { computed, get, set } from '@ember/object';
import Component from '@ember/component';
import defaultIfAbsent from 'textup-frontend/utils/default-if-absent';

export default Component.extend({
  anyChanges: false,

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

  singleOptions: defaultIfAbsent([
    {
      display: 'No',
      command: 'REMOVE',
      color: '#c9302c',
    },
    {
      showWhenSelected: true,
      display: 'Yes',
      command: 'ADD',
      color: '#56a556',
    },
  ]),
  multipleOptions: defaultIfAbsent([
    {
      display: 'None',
      command: 'REMOVE',
      color: '#c9302c',
    },
    {
      display: 'All',
      command: 'ADD',
      color: '#56a556',
    },
  ]),
  noChangeLabel: defaultIfAbsent('No Change'),
  noChangeColor: defaultIfAbsent('#d3d3d3'),

  noBucketsLabel: defaultIfAbsent('No buckets yet.'),

  _actionBucketIdProp: 'bucketId',
  _actionItemIdProp: 'itemId',
  _actionCommandProp: 'action',

  // Computed properties
  // -------------------

  itemList: computed('items', function() {
    const items = this.get('items');
    return isArray(items) ? items : [items];
  }),
  hasManyItems: computed('itemList', function() {
    return this.get('itemList.length') > 1;
  }),
  firstItemBucketMemberships: computed('buckets', 'itemList', 'hasManyItems', function() {
    const memberships = {};
    if (this.get('hasManyItems')) {
      return memberships;
    }
    const bucketIdProp = this.get('bucketIdentityProperty'),
      itemBuckets = this.get('itemBucketProperty'),
      itemCommandProp = this.get('itemBucketCommandProperty'),
      existingBuckets = this.get(`itemList.firstObject.${itemBuckets}`);
    (existingBuckets || []).forEach(
      function(itemBucket) {
        // store value at item command property if specified,
        // otherwise, just store true
        const value = itemCommandProp ? get(itemBucket, itemCommandProp) : true;
        set(memberships, String(get(itemBucket, bucketIdProp)), value);
      }.bind(this)
    );
    return memberships;
  }),

  // Events
  // ------

  didInsertElement() {
    scheduleOnce('afterRender', this, this._determineAnyChanges);
  },

  // Actions
  // -------

  actions: {
    clearActions(bucket) {
      this.clearActions(bucket);
    },
    doActions(bucket, command) {
      this.doActions(bucket, command);
    },
  },

  // Helpers
  // -------

  clearActions(bucket, determineChanges = true) {
    const prop = this.get('actionProperty'),
      actions = get(bucket, prop);
    if (isArray(actions)) {
      actions.clear();
    } else {
      set(bucket, prop, []);
    }
    if (determineChanges) {
      this._determineAnyChanges();
    }
  },
  doActions(bucket, command) {
    this.clearActions(bucket, false);
    const prop = this.get('actionProperty'),
      actions = get(bucket, prop);
    this.get('itemList').forEach(item => {
      actions.pushObject(this._makeAction(bucket, item, command));
    });
    set(bucket, prop, actions);
    this.set('anyChanges', true);
  },
  _makeAction(bucket, item, command) {
    const itemIdProp = this.get('itemIdentityProperty'),
      bucketIdProp = this.get('bucketIdentityProperty'),
      action = {};
    action[this.get('_actionBucketIdProp')] = get(bucket, bucketIdProp);
    action[this.get('_actionItemIdProp')] = get(item, itemIdProp);
    action[this.get('_actionCommandProp')] = command;
    return action;
  },
  _determineAnyChanges() {
    const prop = this.get('actionProperty'),
      anyChanges = this.get('buckets').any(bucket => {
        const actions = get(bucket, prop);
        return actions && actions.length > 0;
      });
    this.set('anyChanges', anyChanges);
    return anyChanges;
  },
});
