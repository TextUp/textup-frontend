import Service, { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';
import RSVP from 'rsvp';
import Constants from 'textup-frontend/constants';
import PhoneNumberUtils from 'textup-frontend/utils/phone-number';

export default Service.extend({
  store: service(),

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
