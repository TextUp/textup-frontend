import Service, { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { run } from '@ember/runloop';
import RSVP from 'rsvp';
import Constants from 'textup-frontend/constants';
import PhoneNumberUtils from 'textup-frontend/utils/phone-number';

export default Service.extend({
  contactService: service(),
  recordItemService: service(),
  requestService: service(),
  store: service(),

  validateAndCheckForName(number, { ctx }) {
    run.debounce(this, this._validateAndCheckForName, number, ctx, 250);
  },
  makeCall(contactToCall, number) {
    return new RSVP.Promise((resolve, reject) => {
      this._ensureContactExists(contactToCall, number).then(contact => {
        this.get('requestService')
          .handleIfError(this.get('recordItemService').makeCall(contact))
          .then(() => resolve(contact), reject);
      });
    });
  },

  // Internal methods
  // ----------------

  _validateAndCheckForName(number, ctx) {
    const max = 30, // we want some options in case the earlier contacts are view-only
      callByNumber = PhoneNumberUtils.clean(number);
    if (PhoneNumberUtils.validate(callByNumber)) {
      this.get('contactService')
        .searchContactsByNumber(callByNumber, { max })
        .then(results => {
          const noViewOnlyContacts = results.toArray().filterBy('isViewPermission', false),
            total = noViewOnlyContacts.length;
          ctx.setProperties({
            callByNumber,
            callByNumberContact: noViewOnlyContacts.get('firstObject'),
            callByNumberIsValid: true,
            callByNumberMoreNum: Math.max(total - 1, 0), // this is an approx total
          });
        });
    } else {
      ctx.setProperties({
        callByNumber,
        callByNumberContact: null,
        callByNumberIsValid: false,
        callByNumberMoreNum: 0,
      });
    }
  },
  _ensureContactExists(contactToCall, number) {
    return new RSVP.Promise((resolve, reject) => {
      if (isPresent(contactToCall)) {
        resolve(contactToCall);
      } else {
        const newContact = this.get('store').createRecord(Constants.MODEL.CONTACT, {
          numbers: [{ number }],
        });
        this.get('contactService')
          .persistNewAndTryAddToPhone(newContact)
          .then(() => resolve(newContact), reject);
      }
    });
  },
});
