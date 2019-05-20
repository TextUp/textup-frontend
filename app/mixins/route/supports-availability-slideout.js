import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import AppUtils from 'textup-frontend/utils/app';
import Constants from 'textup-frontend/constants';

export default Mixin.create({
  authService: service(),
  availabilitySlideoutService: service(),
  dataService: service(),
  tutorialService: service(),

  actions: {
    startAvailabilitySlideout() {
      this.send(
        'toggleSlideout',
        'slideouts/availability',
        AppUtils.controllerNameForRoute(this),
        Constants.SLIDEOUT.OUTLET.DEFAULT
      );
    },
    cancelAvailabilitySlideout() {
      const model = this.get('currentModel'),
        authUser = this.get('authService.authUser');
      model.rollbackAttributes();
      authUser.rollbackAttributes();
      this.get('tutorialService').startCompleteTask(Constants.TASK.AVAILABILITY);
      this.send('closeSlideout');
    },
    finishAvailabilitySlideout() {
      const model = this.get('currentModel'),
        authUser = this.get('authService.authUser');
      this.get('tutorialService').startCompleteTask(Constants.TASK.AVAILABILITY);
      return this.get('dataService')
        .persist([model, authUser])
        .then(() => {
          this.send('closeSlideout');
        });
    },

    onFinishRecordingGreeting(mimeType, data) {
      const phone = this.get('currentModel.phone.content');
      this.get('availabilitySlideoutService').onAddAudio(phone, mimeType, data);
    },
    onRequestVoicemailGreetingCall(numToCall) {
      return this.get('availabilitySlideoutService').onRequestVoicemailGreetingCall(
        this.get('currentModel'),
        numToCall
      );
    },
  },
});
