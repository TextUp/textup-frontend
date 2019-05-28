import AppUtils from 'textup-frontend/utils/app';
import Constants from 'textup-frontend/constants';
import Service, { inject as service } from '@ember/service';
import { readOnly, not } from '@ember/object/computed';

export default Service.extend({
  contactService: service(),
  dataService: service(),
  slideoutService: service(),

  // Properties
  // ----------

  contact: null,
  contactReadableIdent: readOnly(`contact.${Constants.PROP_NAME.READABLE_IDENT}`),
  shouldDisablePrimaryAction: readOnly('_disallowEdits', 'contact.validations.isInvalid'),
  shouldForceKeepOpen: readOnly('contact.isSaving'),

  // Methods
  // -------

  openSlideout(contact) {
    this.set('contact', contact);
    this.get('slideoutService').toggleSlideout(
      'slideouts/contact/edit',
      Constants.SLIDEOUT.OUTLET.DEFAULT
    );
  },
  cancelSlideout() {
    AppUtils.tryRollback(this.get('contact'));
    this.get('slideoutService').closeSlideout();
  },
  finishSlideout() {
    return this.get('dataService')
      .persist(this.get('contact'))
      .then(() => this.get('slideoutService').closeSlideout());
  },
  goToDuplicate(contactId) {
    this.cancelSlideout();
    this.get('router').transitionTo('main.contacts.contact', contactId);
  },

  // Internal
  // --------

  _disallowEdits: not('contact.allowEdits'),
});
