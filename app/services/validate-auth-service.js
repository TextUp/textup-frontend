import Service, { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import ArrayUtils from 'textup-frontend/utils/array';
import callIfPresent from 'textup-frontend/utils/call-if-present';
import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';

export default Service.extend({
  requestService: service(),

  // Methods
  // -------

  checkPassword(username, password, ...thens) {
    return new RSVP.Promise((resolve, reject) => {
      if (!username || !password) {
        return reject();
      }
      this._doValidate({ username, password }).then(() => {
        ArrayUtils.tryCallAll(thens);
        callIfPresent(null, resolve);
      }, reject);
    });
  },
  checkLockCode(username, lockCode) {
    return new RSVP.Promise((resolve, reject) => {
      if (!username || !lockCode) {
        return reject();
      }
      this._doValidate({ username, lockCode }).then(resolve, reject);
    });
  },

  // Internal
  // --------

  _doValidate(data) {
    return this.get('requestService').authRequest({
      type: Constants.REQUEST_METHOD.POST,
      url: `${config.host}/v1/validate`,
      data: JSON.stringify(data),
    });
  },
});
