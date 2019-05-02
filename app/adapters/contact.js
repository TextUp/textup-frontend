import ApplicationAdapter from 'textup-frontend/adapters/application';

export default ApplicationAdapter.extend({
  buildURL() {
    return this._tryAddTeamId(this._super(...arguments));
  },
});
