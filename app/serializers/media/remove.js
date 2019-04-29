import Constants from 'textup-frontend/constants';
import DS from 'ember-data';

export default DS.JSONSerializer.extend({
  attrs: { [Constants.PROP_NAME.MEDIA_ID]: { key: 'uid', serialize: true } },

  serialize() {
    const json = this._super(...arguments);
    json.action = Constants.ACTION.MEDIA.REMOVE;
    return json;
  },
});
