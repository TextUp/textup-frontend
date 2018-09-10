import RecordItemSerializer from './record-item';

export default RecordItemSerializer.extend({
  modelNameFromPayloadKey() {
    return this._super('record-text');
  },

  serialize(snapshot) {
    const json = this._super(...arguments),
      rText = snapshot.record;

    json.sendToContacts = rText.get('contactRecipients').map(obj => obj.get('id'));
    json.sendToSharedContacts = rText.get('sharedContactRecipients').map(obj => obj.get('id'));
    json.sendToTags = rText.get('tagRecipients').map(obj => obj.get('id'));
    json.sendToPhoneNumbers = rText.get('newNumberRecipients');

    return json;
  }
});
