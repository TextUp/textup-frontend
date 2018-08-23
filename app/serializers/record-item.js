import DS from 'ember-data';
import HasAuthor from '../mixins/serializer/has-author';
import HasMedia from '../mixins/serializer/has-media';

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, HasAuthor, HasMedia, {
  attrs: {
    whenCreated: { serialize: false },
    outgoing: { serialize: false },
    hasAwayMessage: { serialize: false },
    receipts: { serialize: false },
    contact: { serialize: false },
    tag: { serialize: false }
  },

  modelNameFromPayloadKey() {
    return this._super('record-item');
  },

  payloadKeyFromModelName() {
    return this._super('record');
  },

  normalizeResponse(store, primaryModelClass, payload) {
    delete payload.links; // TODO test
    return this._super(...arguments);
  },

  _normalizePolymorphicRecord(obj, hash) {
    switch (hash.type) {
      case 'TEXT':
        hash.type = 'record-text';
        break;
      case 'CALL':
        hash.type = 'record-call';
        break;
      case 'NOTE':
        hash.type = 'record-note';
        break;
    }
    return this._super(...arguments);
  }
});
