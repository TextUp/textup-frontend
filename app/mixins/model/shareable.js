import Constants from 'textup-frontend/constants';
import DS from 'ember-data';
import Ember from 'ember';

const { computed } = Ember;

export default Ember.Mixin.create({
  [Constants.PROP_NAME.SHARING_PERMISSION]: DS.attr('string'),
  isShared: computed.notEmpty(Constants.PROP_NAME.SHARING_PERMISSION),

  isDelegatePermission: computed.equal(
    Constants.PROP_NAME.SHARING_PERMISSION,
    Constants.SHARING_PERMISSION.DELEGATE
  ),
  isViewPermission: computed.equal(
    Constants.PROP_NAME.SHARING_PERMISSION,
    Constants.SHARING_PERMISSION.VIEW
  ),
  allowEdits: computed('isShared', 'isDelegatePermission', function() {
    const shared = this.get('isShared'),
      delegate = this.get('isDelegatePermission');
    return !shared || (shared && delegate);
  }),
});
