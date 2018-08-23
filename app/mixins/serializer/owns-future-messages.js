import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Mixin.create(DS.EmbeddedRecordsMixin, {
  attrs: {
    _futureMessages: { key: 'futureMessages', deserialize: 'records', serialize: false }
  }
});
