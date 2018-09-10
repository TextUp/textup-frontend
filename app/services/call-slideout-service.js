import Ember from 'ember';
import {
  validate as validateNumber,
  clean as cleanNumber
} from 'textup-frontend/utils/phone-number';

const { isPresent, run, RSVP } = Ember;

export default Ember.Service.extend({
  contactService: Ember.inject.service(),
  dataService: Ember.inject.service(),
  recordItemService: Ember.inject.service(),
  store: Ember.inject.service(),

  validateAndCheckForName: function(number, { ctx }) {
    run.debounce(this, this._validateAndCheckForName, number, ctx, 250);
  },
  makeCall() {
    return new RSVP.Promise((resolve, reject) => {
      this._ensureContactExists(...arguments).then(contact => {
        this.get('recordItemService')
          .makeCall(contact)
          .then(() => resolve(contact), this.get('dataService').buildErrorHandler(reject));
      });
    });
  },

  // Internal methods
  // ----------------

  _validateAndCheckForName(number, ctx) {
    const maxNum = 30, // we want some options in case the earlier contacts are view-only
      cleaned = cleanNumber(number);
    if (validateNumber(cleaned)) {
      this.get('contactService')
        .searchContactsByNumber(cleaned, { max: maxNum })
        .then(results => {
          const noViewOnlyContacts = results.toArray().filterBy('isSharedView', false),
            total = noViewOnlyContacts.length;
          ctx.setProperties({
            callByNumber: cleaned,
            callByNumberContact: noViewOnlyContacts.get('firstObject'),
            callByNumberMoreNum: Math.max(total - 1, 0), // this is an approx total
            callByNumberIsValid: true
          });
        });
    } else {
      ctx.setProperties({
        callByNumber: cleaned,
        callByNumberContact: null,
        callByNumberIsValid: false,
        callByNumberMoreNum: 0
      });
    }
  },
  _ensureContactExists(contactToCall, number, { displayedList, currentFilter }) {
    return new RSVP.Promise((resolve, reject) => {
      if (isPresent(contactToCall)) {
        resolve(contactToCall);
      } else {
        const newContact = this.get('store').createRecord('contact', { numbers: [{ number }] });
        this.get('contactService')
          .persistNew(newContact, { displayedList, currentFilter })
          .then(() => resolve(newContact), reject);
      }
    });
  }
});
