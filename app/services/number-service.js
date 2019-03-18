import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import { format } from 'textup-frontend/utils/phone-number';

const { computed, RSVP } = Ember;

export default Ember.Service.extend({
  authService: Ember.inject.service(),
  dataService: Ember.inject.service(),
  notifications: Ember.inject.service(),

  // Properties
  // ----------

  publicAPI: computed(function() {
    return { actions: { listAvailable: this._listAvailable.bind(this) } };
  }),

  // Methods
  // -------

  startVerify(num) {
    return new RSVP.Promise((resolve, reject) => {
      this.get('authService')
        .authRequest({
          type: Constants.REQUEST_METHOD.POST,
          url: `${config.host}/v1/numbers`,
          data: JSON.stringify({ phoneNumber: num }),
        })
        .then(success => {
          this.get('notifications').info(`Sent verification text to ${format(num)}`);
          resolve(success);
        }, this.get('dataService').buildErrorHandler(reject));
    });
  },
  finishVerify(num, validationCode) {
    return new RSVP.Promise((resolve, reject) => {
      const notifications = this.get('notifications');
      this.get('authService')
        .authRequest({
          type: Constants.REQUEST_METHOD.POST,
          url: `${config.host}/v1/numbers`,
          data: JSON.stringify({ phoneNumber: num, token: validationCode }),
        })
        .then(
          success => {
            notifications.success(`Successfully validated ${format(num)}`);
            resolve(success);
          },
          failure => {
            if (this.get('dataService').displayErrors(failure) === 0) {
              notifications.error(`Invalid or expired token for ${format(num)}`);
            }
            reject(failure);
          }
        );
    });
  },

  // Internal methods
  // ----------------

  _listAvailable(search = '') {
    return new RSVP.Promise((resolve, reject) => {
      this.get('authService')
        .authRequest({
          type: Constants.REQUEST_METHOD.GET,
          url: `${config.host}/v1/numbers?search=${search}`,
        })
        .then(({ numbers = [] }) => {
          const availableNums = numbers.map(obj => {
            return Ember.Object.create({
              [Constants.PROP_NAME.AVAILABLE_NUMBER]: obj.number,
              [Constants.PROP_NAME.NEW_NUMBER_ID]: obj.sid,
              region: obj.region,
            });
          });
          resolve(availableNums);
        }, this.get('dataService').buildErrorHandler(reject));
    });
  },
});
