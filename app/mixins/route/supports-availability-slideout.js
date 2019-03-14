import Constants from 'textup-frontend/constants';
import Ember from 'ember';

export default Ember.Mixin.create({
  authService: Ember.inject.service(),
  availabilitySlideoutService: Ember.inject.service(),
  dataService: Ember.inject.service(),

  actions: {
    startAvailabilitySlideout() {
      this.send(
        'toggleSlideout',
        'slideouts/availability',
        this.get('routeName'),
        Constants.SLIDEOUT.OUTLET.DEFAULT
      );
    },
    cancelAvailabilitySlideout() {
      const model = this.get('currentModel'),
        authUser = this.get('authService.authUser');
      model.rollbackAttributes();
      authUser.rollbackAttributes();
      this.send('closeSlideout');
    },
    finishAvailabilitySlideout() {
      const model = this.get('currentModel'),
        authUser = this.get('authService.authUser');
      return this.get('dataService')
        .persist([model, authUser])
        .then(() => this.send('closeSlideout'));
    },

    onAvailabilityEntitySwitch(scheduleOwner) {
      return this.get('availabilitySlideoutService').ensureScheduleIsPresent(scheduleOwner);
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
