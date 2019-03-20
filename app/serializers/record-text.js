import RecordItemSerializer from './record-item';

export default RecordItemSerializer.extend({
  modelNameFromPayloadKey() {
    return this._super('record-text');
  },
});
