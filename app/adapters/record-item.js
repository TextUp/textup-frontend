import ApplicationAdapter from 'textup-frontend/adapters/application';

export default ApplicationAdapter.extend({
  pathForType() {
    return this._super('record');
  },
  // always add team id if present
  buildURL(modelName, id, snapshot, requestType) {
    return this._tryAddTeamId(this._super(...arguments), requestType);
  },
});
