import Ember from 'ember';

const { isNone } = Ember;

export default Ember.Mixin.create({
  authService: Ember.inject.service(),
  userSetupService: Ember.inject.service(),

  beforeModel() {
    this._super(...arguments);
    if (
      !this.get('userSetupService').hasSkippedSetup() &&
      !isNone(this.get('authService.authUser.personalNumber'))
    ) {
      this.transitionTo('setup');
    }
  },
});
