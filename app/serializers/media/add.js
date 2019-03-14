import Constants from 'textup-frontend/constants';
import DS from 'ember-data';
import Ember from 'ember';

export default DS.JSONSerializer.extend({
  attrs: { mimeType: { serialize: true } },

  serialize(snapshot) {
    const json = this._super(...arguments);
    json.action = Constants.ACTION.MEDIA.ADD;
    json.data = snapshot.record.get('dataNoHeader');
    json.checksum = snapshot.record.get('checksum');
    return json;
  },
});
