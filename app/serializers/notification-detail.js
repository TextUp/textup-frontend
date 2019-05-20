import { isArray } from '@ember/array';
import DS from 'ember-data';
import OwnsRecordItems from 'textup-frontend/mixins/serializer/owns-record-items';
import { tryNormalizePolymorphicType } from 'textup-frontend/serializers/record-item';

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, OwnsRecordItems, {
  attrs: {
    _recordItems: { key: 'items', deserialize: 'records' },
  },

  normalize(modelClass, hash) {
    if (isArray(hash.items)) {
      hash.items.forEach(tryNormalizePolymorphicType);
    }
    return this._super(...arguments);
  },
});
