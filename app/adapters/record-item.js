import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  pathForType() {
    return this._super('record');
  },
  // always add team id if present
  buildURL: function(modelName, id, snapshot, requestType) {
    return this._tryAddTeamId(this._super(...arguments), requestType);
  }
});
