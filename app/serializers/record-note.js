import RecordItemSerializer from './record-item';

export default RecordItemSerializer.extend({
  attrs: {
    whenChanged: { serialize: false },
    hasBeenDeleted: { key: 'isDeleted', serialize: true },
    isReadOnly: { serialize: false },
    location: { deserialize: 'records', serialize: 'records' },
    _revisions: { key: 'revisions', deserialize: 'records', serialize: false }
  },

  modelNameFromPayloadKey() {
    return this._super('record-note');
  },

  serialize(snapshot) {
    const json = this._super(...arguments),
      rNote = snapshot.record;

    json.after = rNote.get('addAfterDate');
    if (rNote.get('contactRecipients.length')) {
      json.forContact = rNote.get('contactRecipients.firstObject.id');
    }
    if (rNote.get('sharedContactRecipients.length')) {
      json.forSharedContact = rNote.get('sharedContactRecipients.firstObject.id');
    }
    if (rNote.get('tagRecipients.length')) {
      json.forTag = rNote.get('tagRecipients.firstObject.id');
    }

    return json;
  }
});
