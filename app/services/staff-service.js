import Ember from 'ember';
import config from 'textup-frontend/config/environment';
import { format } from 'textup-frontend/utils/phone-number';

const { RSVP } = Ember;

export default Ember.Service.extend({
  authService: Ember.inject.service(),
  dataService: Ember.inject.service(),
  notifications: Ember.inject.service(),
  stateManager: Ember.inject.service('state'),
  store: Ember.inject.service(),

  startVerifyPersonalPhone(num) {
    return new RSVP.Promise((resolve, reject) => {
      this.get('authService')
        .authRequest({
          type: 'POST',
          url: `${config.host}/v1/numbers`,
          data: JSON.stringify({ phoneNumber: num }),
        })
        .then(success => {
          this.get('notifications').info(`Sent verification text to ${format(num)}`);
          resolve(success);
        }, this.get('dataService').buildErrorHandler(reject));
    });
  },
  finishVerifyPersonalPhone(num, validationCode) {
    return new RSVP.Promise((resolve, reject) => {
      const notifications = this.get('notifications');
      this.get('authService')
        .authRequest({
          type: 'POST',
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
});
