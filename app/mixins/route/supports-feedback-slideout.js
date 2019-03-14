import Constants from 'textup-frontend/constants';
import Ember from 'ember';

export default Ember.Mixin.create({
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
        this.get('routeName'),
        Constants.SLIDEOUT.OUTLET.DEFAULT
      );
    },
    finishFeedbackSlideout() {
      this.send('closeSlideout');
      this.controller.set('feedbackMessage', null);
    },
  },
});
