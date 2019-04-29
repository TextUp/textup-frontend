import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  buildURL() {
    return this._tryAddTeamId(this._super(...arguments));
  },
});
