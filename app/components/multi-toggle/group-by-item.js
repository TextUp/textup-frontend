import { isPresent } from '@ember/utils';
import { get, set } from '@ember/object';
import GroupByBucket from 'textup-frontend/components/multi-toggle/group-by-bucket';

export default GroupByBucket.extend({
  layoutName: 'components/multi-toggle/group-by-bucket',

  clearActions(bucket, determineChanges = true) {
    const items = this.get('itemList'),
      actionProperty = this.get('actionProperty'),
      bucketIdProp = this.get('bucketIdentityProperty'),
      actionBucketIdProp = this.get('_actionBucketIdProp'),
      currentBucketIdString = String(get(bucket, bucketIdProp));
    items.forEach(function(item) {
      const actions = get(item, actionProperty) || [],
        foundAction = actions.find(function(action) {
          const actionBucketId = get(action, actionBucketIdProp);
          return String(actionBucketId) === currentBucketIdString;
        });
      if (isPresent(foundAction)) {
        actions.removeObject(foundAction);
      }
      set(item, actionProperty, actions);
    });
    if (determineChanges) {
      this._determineAnyChanges();
    }
  },
  doActions(bucket, command) {
    this.clearActions(bucket, false);
    const items = this.get('itemList'),
      actionProperty = this.get('actionProperty');
    items.forEach(item => {
      const actions = get(item, actionProperty) || [];
      actions.pushObject(this._makeAction(bucket, item, command));
      set(item, actionProperty, actions);
    });
    this.set('anyChanges', true);
  },
  _determineAnyChanges() {
    const prop = this.get('actionProperty'),
      anyChanges = this.get('itemList').any(item => {
        const actions = get(item, prop);
        return actions && actions.length > 0;
      });
    this.set('anyChanges', anyChanges);
    return anyChanges;
  },
});
