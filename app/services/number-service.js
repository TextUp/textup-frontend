import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import { format } from 'textup-frontend/utils/phone-number';

const { RSVP } = Ember;

export default Ember.Service.extend({
  authService: Ember.inject.service(),
  dataService: Ember.inject.service(),
  notifications: Ember.inject.service(),

  startVerify(num) {
    return this.get('dataService')
      .request(
        this.get('authService').authRequest({
          type: Constants.REQUEST_METHOD.POST,
          url: `${config.host}/v1/numbers`,
          data: JSON.stringify({ phoneNumber: num }),
        })
      )
      .then(() => this.get('notifications').info(`Sent verification text to ${format(num)}`));
  },
  finishVerify(num, validationCode) {
    return this.get('dataService')
      .request(
        this.get('authService').authRequest({
          type: Constants.REQUEST_METHOD.POST,
          url: `${config.host}/v1/numbers`,
          data: JSON.stringify({ phoneNumber: num, token: validationCode }),
        })
      )
      .then(() => this.get('notifications').success(`Successfully validated ${format(num)}`));
  },

  listAvailable(search = '') {
    return new RSVP.Promise((resolve, reject) => {
      this.get('dataService')
        .request(
          this.get('authService').authRequest({
            type: Constants.REQUEST_METHOD.GET,
            url: `${config.host}/v1/numbers?search=${search}`,
          })
        )
        .then(({ numbers = [] }) => {
          const availableNums = numbers.map(obj => {
            return Ember.Object.create({
              [Constants.PROP_NAME.AVAILABLE_NUMBER]: obj.number,
              [Constants.PROP_NAME.NEW_NUMBER_ID]: obj.sid,
              region: obj.region,
            });
          });
          resolve(availableNums);
        }, reject);
    });
  },
});
