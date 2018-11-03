import RecordItemSerializer from './record-item';

export default RecordItemSerializer.extend({
  attrs: {
    durationInSeconds: { serialize: false },
    voicemailInSeconds: { serialize: false }
  },

  modelNameFromPayloadKey() {
    return this._super('record-call');
  },

  serialize(snapshot) {
    const json = this._super(...arguments),
      rCall = snapshot.record;

    if (rCall.get('contactRecipients.length')) {
      json.callContact = rCall.get('contactRecipients.firstObject.id');
    }
    if (rCall.get('sharedContactRecipients.length')) {
      json.callSharedContact = rCall.get('sharedContactRecipients.firstObject.id');
    }

    return json;
  }
});
