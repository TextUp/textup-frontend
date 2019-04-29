import Constants from 'textup-frontend/constants';
import Ember from 'ember';

export default Ember.Mixin.create({
  attrs: {
    [Constants.PROP_NAME.SHARING_PERMISSION]: { key: 'permission' },
  },
});
