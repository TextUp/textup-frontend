import RecordItemSerializer from './record-item';

export default RecordItemSerializer.extend({
  attrs: {
    durationInSeconds: { serialize: false },
    voicemailInSeconds: { serialize: false },
  },

  modelNameFromPayloadKey() {
    return this._super('record-call');
  },
});
