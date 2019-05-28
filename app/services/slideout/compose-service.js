import AppUtils from 'textup-frontend/utils/app';
import Constants from 'textup-frontend/constants';
import PhoneNumberUtils from 'textup-frontend/utils/phone-number';
import RSVP from 'rsvp';
import Service, { inject as service } from '@ember/service';
import TypeUtils from 'textup-frontend/utils/type';
import { get, computed } from '@ember/object';
import { getOwner } from '@ember/application';
import { gt, map, or, readOnly } from '@ember/object/computed';
import { isArray } from '@ember/array';

export default Service.extend({
  dataService: service(),
  recordItemService: service(),
  slideoutService: service(),
  stateService: service(),
  tutorialService: service(),

  // Properties
  // ----------

  tagRecipients: readOnly('stateService.owner.phone.content.tags'),
  recipients: null,
  message: null,
  shouldDisablePrimaryAction: computed('message', '_hasRecipients', function() {
    return !this.get('message') || !this.get('_hasRecipients');
  }),
  shouldForceKeepOpen: or('message', '_hasRecipients'),

  // Methods
  // -------

  openSlideout(recipients = null) {
    this.setProperties({
      recipients: isArray(recipients) ? [...recipients] : [],
      message: '',
    });
    this.get('slideoutService').toggleSlideout(
      'slideouts/compose',
      Constants.SLIDEOUT.OUTLET.DEFAULT
    );
  },
  cancelSlideout() {
    this.get('slideoutService').closeSlideout();
  },
  finishSlideout() {
    // [FUTURE] need to revert new numbers back to their original string-only form to be
    // compatible with adding recipients on the record item. Need to revamp recipients handling
    // in the multi-select in the future.
    const rText = this.get('recordItemService').createNewText(this.get('_cleanedRecipients'), {
      contents: this.get('message'),
    });
    return this.get('dataService')
      .persist(rText)
      .then(() => {
        this.get('tutorialService').startCompleteTask(Constants.TASK.MESSAGE);
        this.cancelSlideout();
        // [FUTURE] Right now, newly created contacts aren't pushed to the contacts list so the
        // user needs to refresh before seeing the newly-created contacts. Consider making the
        // contacts to phone relationship automatically managed by Ember Data like the
        // record items to record owners
        if (this.get('stateService.viewingContacts')) {
          getOwner('controller:main/contacts').send('doRefreshContacts');
        }
      })
      .catch(() => AppUtils.tryRollback(rText));
  },

  createRecipient(number) {
    if (PhoneNumberUtils.validate(number)) {
      const cleanedNum = PhoneNumberUtils.clean(number);
      return {
        [Constants.PROP_NAME.URL_IDENT]: cleanedNum,
        [Constants.PROP_NAME.READABLE_IDENT]: cleanedNum,
        [Constants.PROP_NAME.FILTER_VAL]: cleanedNum,
      };
    }
  },
  insertRecipient(index, recipient) {
    return new RSVP.Promise(resolve => {
      this.get('recipients').replace(index, 1, [recipient]);
      resolve();
    });
  },
  removeRecipient(recipient) {
    this.get('recipients').removeObject(recipient);
  },

  // Internal
  // --------

  _hasRecipients: gt('recipients.length', 0),
  _cleanedRecipients: map('recipients', function(recipient) {
    if (recipient) {
      return TypeUtils.isAnyModel(recipient)
        ? recipient
        : get(recipient, Constants.PROP_NAME.READABLE_IDENT);
    }
  }),
});
