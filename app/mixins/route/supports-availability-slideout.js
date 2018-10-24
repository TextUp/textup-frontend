import Ember from 'ember';

export default Ember.Mixin.create({
  authService: Ember.inject.service(),
  availabilitySlideoutService: Ember.inject.service(),
  dataService: Ember.inject.service(),

  setupController(controller) {
    this._super(...arguments);
    controller.setProperties({
      availabilitySlideoutService: this.get('availabilitySlideoutService')
    });
  },

  actions: {
    startAvailabilitySlideout() {
      this.send(
        'toggleSlideout',
        'slideouts/availability',
        this.get('routeName'),
        this.get('constants.SLIDEOUT.OUTLET.DEFAULT')
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

    redoVoicemailGreeting() {
      const phone = this.get('currentModel.phone.content'),
        media = phone.get('media.content');
      if (media) {
        media.rollbackAttributes();
      }
      phone.set('shouldRedoVoicemailGreeting', true);
    },
    onFinishRecordingGreeting(mimeType, data) {
      const phone = this.get('currentModel.phone.content');
      this.get('availabilitySlideoutService')
        .onAddAudio(phone, mimeType, data)
        .then(() => {
          phone.set('shouldRedoVoicemailGreeting', false);
        });
    },
    onRequestVoicemailGreetingCall(numToCall) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        const model = this.get('currentModel'),
          phone = model.get('phone.content');
        phone.set('requestVoicemailGreetingCall', numToCall);
        this.get('dataService')
          .persist(model)
          .then(savedModel => {
            // TODO fix it so that when we get a new audio source the audio player refreshes
            // to display that newly-updated greeting. For now, just close the slideout so when
            // the user opens it again, the audio player will have the chance to rebuild to
            // display the latest voicemail greeting
            this.send('cancelAvailabilitySlideout');
            resolve(savedModel);
          }, reject);
      });
    }
  }
});
