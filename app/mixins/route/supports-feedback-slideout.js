import config from 'textup-frontend/config/environment';
import Ember from 'ember';

export default Ember.Mixin.create({
  tutorialService: Ember.inject.service(),

  setupController(controller) {
    this._super(...arguments);
    const tutorialService = this.get('tutorialService');
    controller.setProperties({ config, feedbackMessage: null, tutorialService });
  },

  actions: {
    startFeedbackSlideout() {
      this.controller.set('feedbackMessage', null);
      this.send(
        'toggleSlideout',
        'slideouts/feedback',
        this.get('routeName'),
        this.get('constants.SLIDEOUT.OUTLET.DEFAULT')
      );
    },
    finishFeedbackSlideout() {
      this.send('closeSlideout');
      this.controller.set('feedbackMessage', null);
    },
    restartTour() {
      const tutorialService = this.get('tutorialService');
      tutorialService.resetTasks();
      this.send('finishFeedbackSlideout');
    }
  }
});
