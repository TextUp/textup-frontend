import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Mixin.create(DS.EmbeddedRecordsMixin, {
  attrs: {
    media: { deserialize: 'records', serialize: false }
  },

  serialize(snapshot) {
    const json = this._super(...arguments) || {};
    json.doMediaActions = snapshot.record.get('media.pendingChanges');
    return json;
  }
});
