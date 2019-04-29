import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import PhoneNumberUtils from 'textup-frontend/utils/phone-number';

const { isBlank, RSVP } = Ember;

export default Ember.Service.extend({
  store: Ember.inject.service(),

  doSearch(search) {
    return new RSVP.Promise((resolve, reject) => {
      if (isBlank(search)) {
        return resolve([]);
      }
      // teamId added by `contact` adapter
      this.get('store')
        .query(Constants.MODEL.CONTACT, { search })
        .then(results => resolve(results.toArray()), reject);
    });
  },
  createRecipient(val) {
    if (PhoneNumberUtils.validate(val)) {
      const num = PhoneNumberUtils.clean(val);
      return {
        [Constants.PROP_NAME.URL_IDENT]: num,
        [Constants.PROP_NAME.READABLE_IDENT]: num,
        [Constants.PROP_NAME.FILTER_VAL]: num,
      };
    }
  },
});
