import Ember from 'ember';
import { validate as validateNumber, clean as cleanNumber } from '../utils/phone-number';

const { isBlank, RSVP } = Ember;

export default Ember.Service.extend({
  stateManager: Ember.inject.service('state'),
  store: Ember.inject.service(),

  doSearch: function(searchString) {
    return new RSVP.Promise((resolve, reject) => {
      if (isBlank(searchString)) {
        return resolve([]);
      }
      const query = Object.create(null),
        team = this.get('stateManager.ownerAsTeam');
      query.search = searchString;
      if (team) {
        query.teamId = team.get('id');
      }
      this.get('store')
        .query('contact', query)
        .then(results => {
          resolve(results.toArray());
        }, reject);
    });
  },
  createRecipient: function(val) {
    if (validateNumber(val)) {
      const num = cleanNumber(val);
      return { uniqueIdentifier: num, identifier: num };
    }
  }
});
