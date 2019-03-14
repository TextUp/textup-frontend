import Constants from 'textup-frontend/constants';
import DS from 'ember-data';

export default DS.JSONSerializer.extend({
  attrs: {
    [Constants.PROP_NAME.MEDIA_ID]: { key: 'uid' },
    _versions: { key: 'versions' },
  },
});
