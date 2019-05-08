import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import ErrorUtils from 'textup-frontend/utils/error';
import PropertyUtils from 'textup-frontend/utils/property';

const { assign, RSVP } = Ember;

export const CONNECTION_ERROR_MSG =
  "Sorry, we're having trouble connecting to the server. This problem is usually the result of a broken Internet connection. You can try refreshing this page.";
export const NOT_LOGGED_IN_MSG = 'Please log in first.';

export default Ember.Service.extend({
  authService: Ember.inject.service(),
  notifications: Ember.inject.service(),

  authRequest(options = {}) {
    return new RSVP.Promise((resolve, reject) => {
      this.handleIfError(
        Ember.$.ajax(
          assign(
            {
              contentType: Constants.MIME_TYPE.JSON,
              beforeSend: this._tryAddAuthHeader.bind(this),
            },
            options
          )
        )
      ).then(resolve, reject);
    });
  },
  handleIfError(promise) {
    return new RSVP.Promise((resolve, reject) => {
      PropertyUtils.ensurePromise(promise).then(resolve, failureObj => {
        const normalizedObj = ErrorUtils.normalizeErrorObject(failureObj);
        this.handleResponseErrorObj(normalizedObj);
        reject(normalizedObj);
      });
    });
  },
  handleResponseErrorObj(failureObj) {
    this._tryHandleResponseError(ErrorUtils.normalizeErrorObject(failureObj));
  },

  // Internal handlers
  // -----------------

  _tryAddAuthHeader(request) {
    const authHeader = this.get('authService.authHeader');
    if (request && authHeader) {
      request.setRequestHeader(Constants.REQUEST_HEADER.AUTH, authHeader);
    }
  },
  _tryHandleResponseError(failureObj) {
    if (ErrorUtils.isResponse(failureObj)) {
      if (ErrorUtils.isResponseStatus(failureObj, Constants.RESPONSE_STATUS.UNAUTHORIZED)) {
        this.get('authService').logout();
        this.get('notifications').info(NOT_LOGGED_IN_MSG);
      } else if (ErrorUtils.isResponseStatus(failureObj, Constants.RESPONSE_STATUS.TIMED_OUT)) {
        this.get('notifications').error(CONNECTION_ERROR_MSG, { clearDuration: 10000 });
      } else {
        ErrorUtils.tryExtractResponseMessages(failureObj).forEach(message => {
          this.get('notifications').error(message);
        });
      }
    }
  },
});
