import DS from 'ember-data';

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, {
  attrs: {
    location: { deserialize: 'records', serialize: false },
    media: { deserialize: 'records', serialize: false }
  },

  modelNameFromPayloadKey(payloadKey) {
    return payloadKey === 'revision'
      ? this._super('record-note-revision')
      : this._super(payloadKey);
  },

  payloadKeyFromModelName(modelName) {
    return this._super('revision');
  }
});
