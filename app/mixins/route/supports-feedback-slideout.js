import AppUtils from 'textup-frontend/utils/app';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';

export default Ember.Mixin.create({
  tutorialService: Ember.inject.service(),

  setupController(controller) {
    this._super(...arguments);
    const tutorialService = this.get('tutorialService');
    controller.setProperties({ feedbackMessage: null, tutorialService });
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
      this.send('closeSlideout');
      this.controller.set('feedbackMessage', null);
    },
    restartTour() {
      this.get('tutorialService').resetTasks();
      this.send('finishFeedbackSlideout');
    },
  },
});
