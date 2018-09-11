import Ember from 'ember';
import IsAuthenticated from 'textup-frontend/mixins/route/is-authenticated';

export default Ember.Route.extend(IsAuthenticated, {
  staffService: Ember.inject.service(),
  storage: Ember.inject.service(),

  redirect() {
    this._super(...arguments);
    const user = this.get('authService.authUser');
    if (Ember.isPresent(user.get('personalPhoneNumber'))) {
      this.transitionTo('main', user);
    }
  },
  setupController(controller) {
    this._super(...arguments);
    controller.setProperties({
      personalNumber: this.get('storage').getItem(this._buildStorageKeyForStaff()),
      verificationCode: null
    });
  },
  actions: {
    startVerifyPersonalPhone(personalNumber) {
      this.get('storage').trySet(localStorage, this._buildStorageKeyForStaff(), personalNumber);
      return this.get('staffService').startVerifyPersonalPhone(personalNumber);
    },
    finishVerifyPersonalPhone(personalNumber, verificationCode) {
      return this.get('staffService')
        .finishVerifyPersonalPhone(personalNumber, verificationCode)
        .then(() => {
          // no need to store personal phone number in local storage once is validated
          this.get('storage').removeItem(this._buildStorageKeyForStaff());

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
  },

  // Internal methods
  // ----------------

  _buildStorageKeyForStaff() {
    return this.get('authService.authUser.username') + '-personal-number';
  }
});
