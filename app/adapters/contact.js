import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  buildURL(modelName, id, snapshot, requestType) {
    const url = this._super(...arguments);
    return this._addTeamIdIfCreate(url, requestType);
  },
});
