import DS from 'ember-data';
import HasAuthor from '../mixins/serializer/has-author';
import HasMedia from '../mixins/serializer/has-media';

const polymorphicTypeToModelName = {
  TEXT: 'record-text',
  CALL: 'record-call',
  NOTE: 'record-note'
};

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, HasAuthor, HasMedia, {
  attrs: {
    whenCreated: { serialize: false },
    outgoing: { serialize: false },
    hasAwayMessage: { serialize: false },
    receipts: { serialize: false },
    contact: { serialize: false },
    tag: { serialize: false }
  },

  modelNameFromPayloadKey(payloadKey) {
    if (payloadKey === 'records' || payloadKey === 'record') {
      return this._super('record-item');
    } else {
      // let pass through (1) results from subclasses, (2) non-model keys like the `link` object
      return this._super(...arguments);
    }
  },

  payloadKeyFromModelName() {
    return this._super('record');
  },

  _normalizePolymorphicRecord(obj, hash) {
    if (Object.keys(polymorphicTypeToModelName).indexOf(hash.type) !== -1) {
      hash.type = polymorphicTypeToModelName[hash.type];
    }
    return this._super(...arguments);
  }
});
