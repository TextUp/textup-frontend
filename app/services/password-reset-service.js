import callIfPresent from 'textup-frontend/utils/call-if-present';
import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';

const { RSVP } = Ember;

export const GET_TOKEN_SUCCESS_MSG =
  'All good! The password reset should be in your inbox in a few minutes.';
export const RESET_PASSWORD_SUCCESS_MSG = 'Successfully reset your password!';

export default Ember.Service.extend({
  notifications: Ember.inject.service('notification-messages-service'),
  requestService: Ember.inject.service(),

  // Methods
  // -------

  getToken(username) {
    return new RSVP.Promise((resolve, reject) => {
      if (!username) {
        return reject();
      }
      this.get('requestService')
        .handleIfError(
          Ember.$.ajax({
            type: Constants.REQUEST_METHOD.POST,
            url: `${config.host}/v1/public/reset`,
            contentType: Constants.MIME_TYPE.JSON,
            data: JSON.stringify({ username }),
          })
        )
        .then(this._getTokenSuccess.bind(this, resolve), reject);
    });
  },
  updatePasswordWithToken(token, password) {
    return new RSVP.Promise((resolve, reject) => {
      if (!token || !password) {
        return reject();
      }
      this.get('requestService')
        .handleIfError(
          Ember.$.ajax({
            type: Constants.REQUEST_METHOD.PUT,
            url: `${config.host}/v1/public/reset/${token}`,
            contentType: Constants.MIME_TYPE.JSON,
            data: JSON.stringify({ password }),
          })
        )
        .then(this._updatePasswordSuccess.bind(this, resolve), reject);
    });
  },

  // Internal
  // --------

  _getTokenSuccess(resolve) {
    this.get('notifications').success(GET_TOKEN_SUCCESS_MSG);
    callIfPresent(null, resolve);
  },
  _updatePasswordSuccess(resolve) {
    this.get('notifications').success(RESET_PASSWORD_SUCCESS_MSG);
    callIfPresent(null, resolve);
  },
});
