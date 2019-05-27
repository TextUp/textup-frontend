import Constants from 'textup-frontend/constants';
import Service, { inject as service } from '@ember/service';
import { notEmpty, not } from '@ember/object/computed';

export default Service.extend({
  slideoutService: service(),
  stateService: service(),
  tutorialService: service(),

  // Properties
  // ----------

  message: null,
  hasMessage: notEmpty('message'),
  shouldAllowRestartTour: not('stateService.ownerIsOrg'),

  // Methods
  // -------

  openSlideout() {
    this.set('message', null);
    this.get('slideoutService').toggleSlideout(
      'slideouts/support',
      Constants.SLIDEOUT.OUTLET.DEFAULT
    );
  },
  cancelSlideout() {
    // We do not clear the `message`` property when closing because the
    // form `submit`` event needs to read the message for submission.
    // Instead, we reset the `message` when opening this slideout`
    this.get('slideoutService').closeSlideout();
  },
  restartTour() {
    this.get('tutorialService').resetTasks();
    this.cancelSlideout();
  },
});
