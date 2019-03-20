import DS from 'ember-data';
import HasAuthor from 'textup-frontend/mixins/serializer/has-author';
import HasMedia from 'textup-frontend/mixins/serializer/has-media';

const polymorphicTypeToModelName = {
  TEXT: 'record-text',
  CALL: 'record-call',
  NOTE: 'record-note',
};

export function tryNormalizePolymorphicType(hash) {
  if (hash && Object.keys(polymorphicTypeToModelName).indexOf(hash.type) !== -1) {
    hash.type = polymorphicTypeToModelName[hash.type];
  }
}

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, HasAuthor, HasMedia, {
  attrs: {
    whenCreated: { serialize: false },
    outgoing: { serialize: false },
    hasAwayMessage: { serialize: false },
    hasBeenDeleted: { key: 'isDeleted', serialize: true },
    receipts: { serialize: false },
    contact: { serialize: false },
    tag: { serialize: false },
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
    tryNormalizePolymorphicType(hash);
    return this._super(...arguments);
  },

  serialize(snapshot) {
    const json = this._super(...arguments),
      rItem = snapshot.record;
    json.ids = rItem.get('recipients').map(obj => obj.get('id'));
    json.numbers = rItem.get('newNumberRecipients');
    return json;
  },
});
