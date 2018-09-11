import Ember from 'ember';
import IsAuthenticated from 'textup-frontend/mixins/route/is-authenticated';

export default Ember.Route.extend(IsAuthenticated, {
  staffService: Ember.inject.service(),

  redirect() {
    this._super(...arguments);
    const user = this.get('authService.authUser');
    if (Ember.isPresent(user.get('personalPhoneNumber'))) {
      this.transitionTo('main', user);
    }
  },
  actions: {
    startVerifyPersonalPhone() {
      return this.get('staffService').startVerifyPersonalPhone(...arguments);
    },
    finishVerifyPersonalPhone(personalNumber) {
      return this.get('staffService')
        .finishVerifyPersonalPhone(...arguments)
        .then(() => {
          const staff = this.get('authService.authUser');
          staff.set('personalPhoneNumber', personalNumber);
          return this.get('dataService')
            .persist(staff)
            .then(() => {
              this.transitionTo('main', staff);
            });
        });
    },
    skipSetup() {
      this.get('stateManager').skipSetup();
      this.transitionTo('main', this.get('authService.authUser'));
    }
  }
});
