import AppUtils from 'textup-frontend/utils/app';
import Constants from 'textup-frontend/constants';
import Service, { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { or } from '@ember/object/computed';

export default Service.extend({
  authService: service(),
  dataService: service(),
  slideoutService: service(),
  stateService: service(),

  // Properties
  // ----------

  staffForm: null,
  shouldShowFooter: computed(
    'stateService.owner.isDirty',
    'authService.authUser.isDirty',
    'staffForm.isModifyingAPropertyRequiringConfirm',
    function() {
      return (
        (this.get('stateService.owner.isDirty') || this.get('authService.authUser.isDirty')) &&
        !this.get('staffForm.isModifyingAPropertyRequiringConfirm')
      );
    }
  ),
  shouldDisablePrimaryAction: or(
    'stateService.owner.validations.isInvalid',
    'authService.authUser.validations.isInvalid'
  ),
  shouldForceKeepOpen: or('stateService.owner.isSaving', 'authService.authUser.isSaving'),

  // Methods
  // -------

  openSlideout() {
    this.get('slideoutService').toggleSlideout(
      'slideouts/account',
      Constants.SLIDEOUT.OUTLET.DEFAULT
    );
  },
  revertAllChanges() {
    AppUtils.tryRollback(this.get('stateService.owner'));
    AppUtils.tryRollback(this.get('authService.authUser'));
  },
  cancelSlideout() {
    this.revertAllChanges();
    this.get('slideoutService').closeSlideout();
  },
  finishSlideout() {
    this.get('dataService')
      .persist([this.get('stateService.owner'), this.get('authService.authUser')])
      .then(() => this.get('slideoutService').closeSlideout());
  },
});
