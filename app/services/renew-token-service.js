import callIfPresent from 'textup-frontend/utils/call-if-present';
import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';

const { RSVP } = Ember;

export const KEY_ALREADY_OVERRIDEN = '_alreadyOverriden';
export const KEY_ALREADY_RENEWED = '_alreadyTriedToRenew';

export const KEY_BEFORE_SEND_FN = 'beforeSend';
export const KEY_ERROR_FN = 'error';
export const KEY_STATUS = 'status';

export default Ember.Service.extend({
  authService: Ember.inject.service(),

  // Methods
  // -------

  startWatchingAjaxRequests() {
    Ember.$.ajaxPrefilter(this._tryRenewTokenOnError.bind(this));
  },

  // This should happen transparently so don't wrap this in `requestService`'s  error handler
  tryRenewToken() {
    return new RSVP.Promise((resolve, reject) => {
      Ember.$.ajax({
        [KEY_ALREADY_OVERRIDEN]: true, // short circuit `_tryRenewTokenOnError`
        type: Constants.REQUEST_METHOD.POST,
        url: `${config.host}/oauth/access_token`,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        data: {
          grant_type: Constants.RESPONSE_KEY.REFRESH_TOKEN,
          [Constants.RESPONSE_KEY.REFRESH_TOKEN]: this.get('authService.refreshToken'),
        },
      }).then(responseObj => {
        this.get('authService').storeAuthResponseSuccess(responseObj, resolve);
      }, reject);
    });
  },

  // Internal
  // --------

  _tryRenewTokenOnError(options, originalOptions) {
    // Don't try to override error handler to try to renew token if
    // (1) we've already overriden handler
    // (2) no error handler is attached
    // (3) don't have an refresh token
    // (4) don't have an access token
    if (
      originalOptions[KEY_ALREADY_OVERRIDEN] ||
      !originalOptions[KEY_ERROR_FN] ||
      !this.get('authService.refreshToken') ||
      !this.get('authService.token')
    ) {
      return;
    }
    originalOptions[KEY_ALREADY_OVERRIDEN] = true;
    // override before send on `originalOptions` so that our updated access token
    // will show up in subsequent request if it is renewed and the ajax
    // call is retried using the `originalOptions`
    originalOptions[KEY_BEFORE_SEND_FN] = this._newBeforeSend.bind(
      this,
      originalOptions[KEY_BEFORE_SEND_FN]
    );
    // we override the error handler on `options` so that this current request
    // that is going out will exhibit the intercepted error behavior in the case
    // that this current ajax request being made results in a 401 error
    options[KEY_ERROR_FN] = this._newError.bind(this, originalOptions);
  },

  _newBeforeSend(originalBeforeSend, xhr, ...otherArgs) {
    callIfPresent(null, originalBeforeSend, [xhr, ...otherArgs]);
    xhr.setRequestHeader(Constants.REQUEST_HEADER.AUTH, this.get('authService.authHeader'));
  },

  _newError(originalOptions, xhr, ...otherArgs) {
    if (
      xhr[KEY_STATUS] === Constants.RESPONSE_STATUS.UNAUTHORIZED &&
      !originalOptions[KEY_ALREADY_RENEWED]
    ) {
      originalOptions[KEY_ALREADY_RENEWED] = true;
      this.tryRenewToken().then(
        () => Ember.$.ajax(originalOptions),
        originalOptions[KEY_ERROR_FN].bind(null, xhr, ...otherArgs)
      );
    } else {
      originalOptions[KEY_ERROR_FN](xhr, ...otherArgs);
    }
  },
});
