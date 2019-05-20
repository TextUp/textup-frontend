import EmberObject from '@ember/object';
import Service, { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import { format } from 'textup-frontend/utils/phone-number';

export default Service.extend({
  dataService: service(),
  notifications: service('notification-messages-service'),
  requestService: service(),

  startVerify(num) {
    return this.get('requestService')
      .authRequest({
        type: Constants.REQUEST_METHOD.POST,
        url: `${config.host}/v1/numbers`,
        data: JSON.stringify({ phoneNumber: num }),
      })
      .then(() => this.get('notifications').info(`Sent verification text to ${format(num)}`));
  },
  finishVerify(num, validationCode) {
    return this.get('requestService')
      .authRequest({
        type: Constants.REQUEST_METHOD.POST,
        url: `${config.host}/v1/numbers`,
        data: JSON.stringify({ phoneNumber: num, token: validationCode }),
      })
      .then(() => this.get('notifications').success(`Successfully validated ${format(num)}`));
  },

  listAvailable(search = '') {
    return new RSVP.Promise((resolve, reject) => {
      this.get('requestService')
        .authRequest({
          type: Constants.REQUEST_METHOD.GET,
          url: `${config.host}/v1/numbers?search=${search}`,
        })
        .then(({ numbers = [] }) => {
          const availableNums = numbers.map(obj => {
            return EmberObject.create({
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
