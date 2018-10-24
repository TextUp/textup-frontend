import DS from 'ember-data';
import HasAuthor from 'textup-frontend/mixins/serializer/has-author';
import HasMedia from 'textup-frontend/mixins/serializer/has-media';

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
    this._tryNormalizePolymorphicType(hash);
    return this._super(...arguments);
  },

  // Helpers
  // -------

  _tryNormalizePolymorphicType(hash) {
    if (hash && Object.keys(polymorphicTypeToModelName).indexOf(hash.type) !== -1) {
      hash.type = polymorphicTypeToModelName[hash.type];
    }
  }
});
