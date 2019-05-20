import Mixin from '@ember/object/mixin';
import Constants from 'textup-frontend/constants';

export default Mixin.create({
  attrs: {
    [Constants.PROP_NAME.SHARING_PERMISSION]: { key: 'permission' },
  },
});
