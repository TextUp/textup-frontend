import AppUtils from 'textup-frontend/utils/app';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';

export default Ember.Mixin.create({
  tutorialService: Ember.inject.service(),

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
