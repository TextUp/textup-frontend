import DS from 'ember-data';
import Ember from 'ember';
import { MEDIA_ID_PROP_NAME } from 'textup-frontend/models/media';

export default DS.JSONSerializer.extend({
  constants: Ember.inject.service(),

  attrs: { [MEDIA_ID_PROP_NAME]: { key: 'uid', serialize: true } },

  serialize() {
    const json = this._super(...arguments);
    json.action = this.get('constants.ACTION.MEDIA.REMOVE');
    return json;
  }
});
