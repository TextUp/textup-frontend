import Constants from 'textup-frontend/constants';
import DS from 'ember-data';
import OwnsPhone from 'textup-frontend/mixins/serializer/owns-phone';

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, OwnsPhone, {
  attrs: {
    org: { deserialize: 'records', serialize: 'ids' },
    // any changes happen with teamActions on the individual tags
    [Constants.MODEL.TEAMS]: { deserialize: 'records', serialize: false },
    channelName: { serialize: false },
  },

  serialize() {
    const json = this._super(...arguments);
    json.org = { id: json.org };
    if (!json.password) {
      delete json.password;
    }
    if (!json.lockCode) {
      delete json.lockCode;
    }
    return json;
  },
});
