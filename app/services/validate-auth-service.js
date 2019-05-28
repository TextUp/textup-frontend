import ArrayUtils from 'textup-frontend/utils/array';
import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import PropertyUtils from 'textup-frontend/utils/property';
import RSVP from 'rsvp';
import Service, { inject as service } from '@ember/service';

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
        PropertyUtils.callIfPresent(resolve);
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
