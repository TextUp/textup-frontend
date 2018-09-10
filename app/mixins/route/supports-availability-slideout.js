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
      this.get('dataService')
        .persist([model, authUser])
        .then(() => this.send('closeSlideout'));
    }
  }
});
