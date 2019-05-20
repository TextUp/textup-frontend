import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import AppUtils from 'textup-frontend/utils/app';
import Constants from 'textup-frontend/constants';

export default Mixin.create({
  tutorialService: service(),

  setupController(controller) {
    this._super(...arguments);
    controller.setProperties({ feedbackMessage: null });
  },

  actions: {
    startFeedbackSlideout() {
      this.controller.set('feedbackMessage', null);
      this.send(
        'toggleSlideout',
        'slideouts/feedback',
        AppUtils.controllerNameForRoute(this),
        Constants.SLIDEOUT.OUTLET.DEFAULT
      );
    },
    finishFeedbackSlideout() {
      // We do not clear the `feedbackMessage`` property when closing because the
      // form `submit`` event needs to read the message for submission.
      // Instead, we reset the `feedbackMessage` when opening this slideout`
      this.send('closeSlideout');
    },
    restartTour() {
      this.get('tutorialService').resetTasks();
      this.send('finishFeedbackSlideout');
    },
  },
});
