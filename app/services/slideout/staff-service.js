import AppUtils from 'textup-frontend/utils/app';
import Constants from 'textup-frontend/constants';
import Service, { inject as service } from '@ember/service';
import { readOnly } from '@ember/object/computed';

export default Service.extend({
  dataService: service(),
  slideoutService: service(),
  staffService: service(),

  // Properties
  // ----------

  staff: null,
  shouldDisablePrimaryAction: readOnly('staff.validations.isInvalid'),
  shouldForceKeepOpen: readOnly('staff.isSaving'),

  // Methods
  // -------

  openSlideout(org) {
    this.set('staff', this.get('staffService').createNew(org));
    this.get('slideoutService').toggleSlideout(
      'slideouts/staff/create',
      Constants.SLIDEOUT.OUTLET.DEFAULT
    );
  },
  cancelSlideout() {
    AppUtils.tryRollback(this.get('staff'));
    this.get('slideoutService').closeSlideout();
  },
  finishSlideout() {
    return this.get('staffService')
      .persistNew(this.get('staff'))
      .then(() => this.get('slideoutService').closeSlideout());
  },
});
