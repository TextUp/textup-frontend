import { notEmpty, equal } from '@ember/object/computed';
import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import Constants from 'textup-frontend/constants';
import DS from 'ember-data';

export default Mixin.create({
  [Constants.PROP_NAME.SHARING_PERMISSION]: DS.attr('string'),
  isShared: notEmpty(Constants.PROP_NAME.SHARING_PERMISSION),

  isDelegatePermission: equal(
    Constants.PROP_NAME.SHARING_PERMISSION,
    Constants.SHARING_PERMISSION.DELEGATE
  ),
  isViewPermission: equal(
    Constants.PROP_NAME.SHARING_PERMISSION,
    Constants.SHARING_PERMISSION.VIEW
  ),
  allowEdits: computed('isShared', 'isDelegatePermission', function() {
    const shared = this.get('isShared'),
      delegate = this.get('isDelegatePermission');
    return !shared || (shared && delegate);
  }),
});
