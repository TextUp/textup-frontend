import Constants from 'textup-frontend/constants';
import DS from 'ember-data';
import Ember from 'ember';
import { MEDIA_ID_PROP_NAME } from 'textup-frontend/models/media';

export default DS.JSONSerializer.extend({
  attrs: { [MEDIA_ID_PROP_NAME]: { key: 'uid', serialize: true } },

  serialize() {
    const json = this._super(...arguments);
    json.action = Constants.ACTION.MEDIA.REMOVE;
    return json;
  },
});
