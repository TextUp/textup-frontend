import Mixin from '@ember/object/mixin';
import DS from 'ember-data';

export default Mixin.create(DS.EmbeddedRecordsMixin, {
  attrs: {
    _futureMessages: { key: 'futureMessages', deserialize: 'records', serialize: false }
  }
});
