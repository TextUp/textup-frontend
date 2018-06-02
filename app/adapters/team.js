import ApplicationAdapter from './application';
import Ember from 'ember';

export default ApplicationAdapter.extend({
  authManager: Ember.inject.service('auth'),

  buildURL: function() {
    const url = this._super(...arguments);
    return this._addQueryParam(url, 'timezone', this.get('authManager.timezone'));
  }
});
