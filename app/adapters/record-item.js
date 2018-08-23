import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  pathForType() {
    return this._super('record');
  },
  buildURL: function(modelName, id, snapshot, requestType) {
    return this._addTeamIdIfCreate(this._super(...arguments), requestType);
  }
});
