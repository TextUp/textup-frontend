import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import DS from 'ember-data';

export default DS.RESTAdapter.extend({
  authService: service(),
  stateService: service(),

  host: config.host,
  namespace: 'v1',
  coalesceFindRequests: true,
  headers: computed('authService.authHeader', function() {
    const authHeader = this.get('authService.authHeader');
    return authHeader ? { [Constants.REQUEST_HEADER.AUTH]: authHeader } : {};
  }),

  // Helper methods
  // --------------

  _tryAddTeamId(url) {
    const team = this.get('stateService.ownerAsTeam');
    return this._addQueryParam(url, 'teamId', team && team.get('id'));
  },
  _addQueryParam(url, queryKey, queryVal) {
    if (url && queryKey && queryVal) {
      const hasQuery = url.indexOf('?') !== -1;
      return hasQuery ? `${url}&${queryKey}=${queryVal}` : `${url}?${queryKey}=${queryVal}`;
    } else {
      return url;
    }
  },
});
