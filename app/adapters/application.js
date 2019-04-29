import DS from 'ember-data';
import Ember from 'ember';
import config from '../config/environment';

export default DS.RESTAdapter.extend({
  authService: Ember.inject.service(),
  stateManager: Ember.inject.service('state'),

  host: config.host,
  namespace: 'v1',
  coalesceFindRequests: true,
  headers: Ember.computed('authService.token', function() {
    const token = this.get('authService.token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }),

  // Helper methods
  // --------------

  _tryAddTeamId(url) {
    const team = this.get('stateManager.ownerAsTeam');
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
