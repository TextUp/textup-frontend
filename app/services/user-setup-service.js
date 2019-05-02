import Ember from 'ember';
import StorageUtils from 'textup-frontend/utils/storage';

const { RSVP } = Ember;

export default Ember.Service.extend({
  authService: Ember.inject.service(),
  dataService: Ember.inject.service(),
  numberService: Ember.inject.service(),
  storageService: Ember.inject.service(),

  // Properties
  // ----------

  inProgressPersonalNumber: null,
  verificationCode: null,

  // Methods
  // -------

  skipSetup() {
    this.get('storageService').setItem(
      StorageUtils.skipSetupKey(this.get('authService.authUser')),
      StorageUtils.TRUE
    );
  },
  hasSkippedSetup() {
    return (
      this.get('storageService').getItem(
        StorageUtils.skipSetupKey(this.get('authService.authUser'))
      ) === StorageUtils.TRUE
    );
  },

  tryRestorePreviousState() {
    this.setProperties({
      inProgressPersonalNumber: this.get('storageService').getItem(
        StorageUtils.setupInProgressPhoneNumberKey(this.get('authService.authUser'))
      ),
      verificationCode: null,
    });
  },

  startPersonalNumberSetup() {
    const pNum = this.get('inProgressPersonalNumber');
    // Store the in-progress phone number in case the user has to reload the page to find the token
    this.get('storageService').setItem(
      StorageUtils.setupInProgressPhoneNumberKey(this.get('authService.authUser')),
      pNum
    );
    return this.get('numberService').startVerify(pNum);
  },
  finishPersonalNumberSetup() {
    const pNum = this.get('inProgressPersonalNumber'),
      vCode = this.get('verificationCode'),
      authUser = this.get('authService.authUser');
    return new RSVP.Promise((resolve, reject) => {
      this.get('numberService')
        .finishVerify(pNum, vCode)
        .then(() => {
          // no need to store personal phone number in once is validated
          this.get('storageService').removeItem(
            StorageUtils.setupInProgressPhoneNumberKey(authUser)
          );
          this.setProperties({ inProgressPersonalNumber: null, verificationCode: null });
          // update the logged-in user's personal phone numbe
          authUser.set('personalNumber', pNum);
          return this.get('dataService').persist(authUser);
        })
        .then(() => resolve(authUser), reject);
    });
  },
});
