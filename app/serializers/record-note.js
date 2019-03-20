import RecordItemSerializer from './record-item';

export default RecordItemSerializer.extend({
  attrs: {
    whenChanged: { serialize: false },
    isReadOnly: { serialize: false },
    location: { deserialize: 'records', serialize: 'records' },
    _revisions: { key: 'revisions', deserialize: 'records', serialize: false },
  },

  modelNameFromPayloadKey() {
    return this._super('record-note');
  },

  serialize(snapshot) {
    const json = this._super(...arguments),
      rNote = snapshot.record;
    json.after = rNote.get('addAfterDate');
    return json;
  },
});
