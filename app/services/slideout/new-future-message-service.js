import AppUtils from 'textup-frontend/utils/app';
import Constants from 'textup-frontend/constants';
import Service, { inject as service } from '@ember/service';
import { readOnly } from '@ember/object/computed';

export default Service.extend({
  futureMessageService: service(),
  slideoutService: service(),

  // Properties
  // ----------

  futureMessage: null,
  shouldDisablePrimaryAction: readOnly('futureMessage.validations.isInvalid'),
  shouldForceKeepOpen: readOnly('futureMessage.isSaving'),

  // Methods
  // -------

  openSlideout(owner) {
    this.set('futureMessage', this.get('futureMessageService').createNew(owner));
    this.get('slideoutService').toggleSlideout(
      'slideouts/future-message/create',
      Constants.SLIDEOUT.OUTLET.DETAIL
    );
  },
  cancelSlideout() {
    AppUtils.tryRollback(this.get('futureMessage'));
    this.get('slideoutService').closeSlideout();
  },
  finishSlideout() {
    return this.get('futureMessageService')
      .persistNew(this.get('futureMessage'))
      .then(() => this.get('slideoutService').closeSlideout());
  },
});
