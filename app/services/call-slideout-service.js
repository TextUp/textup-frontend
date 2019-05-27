import Constants from 'textup-frontend/constants';
import ContactNumberObject from 'textup-frontend/objects/contact-number-object';
import PhoneNumberUtils from 'textup-frontend/utils/phone-number';
import RSVP from 'rsvp';
import Service, { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { debounce, next } from '@ember/runloop';
import { isPresent } from '@ember/utils';
import { readOnly } from '@ember/object/computed';

export const STARTED_CALL_MSG_PREFIX = 'Calling your personal phone number to connect you to ';
export const MAX_NUM_RESULTS = 30;

export default Service.extend({
  contactService: service(),
  notifications: service('notification-messages-service'),
  recordItemService: service(),
  requestService: service(),
  router: service(),
  slideoutService: service(),
  store: service(),
  tutorialService: service(),

  // Properties
  // ----------

  numToCall: null,
  contactToCall: null,
  contactToCallOtherNumCount: 0,

  shouldDisablePrimaryAction: computed(
    'numToCall',
    '_numToCallIsValid',
    '_isStartingCall',
    function() {
      return (
        !this.get('numToCall') || !this.get('_numToCallIsValid') || this.get('_isStartingCall')
      );
    }
  ),
  // In case the primary action is triggered from submitting `number-control`
  primaryActionLabel: computed('_isStartingCall', function() {
    return this.get('_isStartingCall') ? 'Calling...' : 'Call';
  }),
  shouldForceKeepOpen: readOnly('_isStartingCall'),

  // Methods
  // -------

  openSlideout() {
    this.setProperties({
      numToCall: null,
      contactToCall: null,
      contactToCallOtherNumCount: 0,
      _numToCallIsValid: false,
      _isStartingCall: false,
    });
    this.get('slideoutService').toggleSlideout('slideouts/call', Constants.SLIDEOUT.OUTLET.DEFAULT);
  },
  cancelSlideout() {
    this.get('slideoutService').closeSlideout();
  },
  finishSlideout() {
    // don't start another call if one is already being started
    if (this.set('_isStartingCall') || !this.get('_numToCallIsValid')) {
      return;
    }
    this.set('_isStartingCall', true); // force keep open
    return this._ensureContactExists()
      .then(contact => {
        this.get('requestService')
          .handleIfError(this.get('recordItemService').makeCall(contact))
          .then(() => RSVP.resolve(contact));
      })
      .then(contact => {
        this.get('tutorialService').startCompleteTask(Constants.TASK.CALL);
        this.set('_isStartingCall', false);
        this.cancelSlideout();
        next(this, this._openContactAfterStartingCall, contact.get('id'), contact.get('name'));
      });
  },
  onCallNumberChange(number) {
    const numToCall = PhoneNumberUtils.clean(number);
    // set immediately that DOM can update immediately
    this.setProperties({
      numToCall,
      _numToCallIsValid: PhoneNumberUtils.validate(numToCall),
    });
    debounce(this, this._validateAndCheckForName, numToCall, 250);
  },

  // Internal methods
  // ----------------

  _isStartingCall: false,
  _numToCallIsValid: false,

  _openContactAfterStartingCall(contactId, contactName) {
    this.get('router')
      .transitionTo('main.contacts.contact', contactId, {
        queryParams: { filter: Constants.CONTACT.FILTER.ALL },
      })
      .then(() => this.get('notifications').success(STARTED_CALL_MSG_PREFIX + contactName));
  },
  _validateAndCheckForName(number) {
    if (PhoneNumberUtils.validate(number)) {
      this.get('contactService')
        .searchContacts(number, { max: MAX_NUM_RESULTS })
        .then(searchResults => {
          const noViewOnlyContacts = searchResults.filterBy('isViewPermission', false);
          this.setProperties({
            contactToCall: noViewOnlyContacts.get('firstObject'),
            contactToCallOtherNumCount: Math.max(noViewOnlyContacts.length - 1, 0), // this is an approx total
          });
        });
    } else {
      this.setProperties({ contactToCall: null, contactToCallOtherNumCount: 0 });
    }
  },
  _ensureContactExists() {
    return new RSVP.Promise((resolve, reject) => {
      const contactToCall = this.get('contactToCall');
      if (isPresent(contactToCall)) {
        resolve(contactToCall);
      } else {
        const newContact = this.get('store').createRecord(Constants.MODEL.CONTACT, {
          numbers: [ContactNumberObject.create({ number: this.get('numToCall') })],
        });
        this.get('contactService')
          .persistNew(newContact)
          .then(() => resolve(newContact), reject);
      }
    });
  },
});
