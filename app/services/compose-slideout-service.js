import PhoneNumberUtils from 'textup-frontend/utils/phone-number';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';

const { isBlank, RSVP } = Ember;

export default Ember.Service.extend({
  stateManager: Ember.inject.service('state'),
  store: Ember.inject.service(),

  doSearch(searchString) {
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
  createRecipient(val) {
    if (PhoneNumberUtils.validate(val)) {
      const num = PhoneNumberUtils.clean(val);
      return { [Constants.PROP_NAME.URL_IDENT]: num, [Constants.PROP_NAME.READABLE_IDENT]: num };
    }
  },
});
