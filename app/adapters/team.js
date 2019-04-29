import ApplicationAdapter from './application';
import Ember from 'ember';

export default ApplicationAdapter.extend({
  authService: Ember.inject.service(),

  buildURL() {
    const url = this._super(...arguments);
    return this._addQueryParam(url, 'timezone', this.get('authService.timezone'));
  },
});
