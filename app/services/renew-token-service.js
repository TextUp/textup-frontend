import $ from 'jquery';
import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import RSVP from 'rsvp';
import Service, { inject as service } from '@ember/service';
import { bind } from '@ember/runloop';

export const KEY_ALREADY_OVERRIDDEN = '_alreadyOverriden';
export const KEY_ALREADY_RENEWED = '_alreadyTriedToRenew';

export const KEY_BEFORE_SEND_FN = 'beforeSend';
export const KEY_ERROR_FN = 'error';
export const KEY_ORIGINAL_ERROR_FN = '_error';
export const KEY_STATUS = 'status';

export default Service.extend({
  authService: service(),

  // Methods
  // -------

  startWatchingAjaxRequests() {
    $.ajaxPrefilter(this._tryRenewTokenOnError.bind(this));
  },

  // This should happen transparently so don't wrap this in `requestService`'s  error handler
  tryRenewToken() {
    return new RSVP.Promise((resolve, reject) => {
      $.ajax({
        // do not want to retry this attempt if this fails or else we'd be in an infinite loop
        [KEY_ALREADY_OVERRIDDEN]: true,
        type: Constants.REQUEST_METHOD.POST,
        url: `${config.host}/oauth/access_token`,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        data: {
          grant_type: Constants.RESPONSE_KEY.REFRESH_TOKEN,
          [Constants.RESPONSE_KEY.REFRESH_TOKEN]: this.get('authService.refreshToken'),
        },
      }).then(
        bind(this, function(responseObj) {
          this.get('authService').storeAuthResponseSuccess(responseObj, resolve);
        }),
        reject
      );
    });
  },

  // Internal
  // --------

  // Not only retry the request but also re-wrap the jqXHR object in a new Deferred object so that
  // the promise callbacks will resolve based on the outcome of the retry attempt
  // See https://stackoverflow.com/a/12840617
  _tryRenewTokenOnError(options, originalOptions, xhr) {
    // Don't try to override error handler to try to renew token if we've already overridden handler
    // or if we don't have a refresh token to get a new token to retry the request
    if (originalOptions[KEY_ALREADY_OVERRIDDEN] || !this.get('authService.refreshToken')) {
      return;
    }
    // create our own deferred object to handle done/fail callbacks
    const deferred = $.Deferred();
    // if the request works, return normally
    xhr.done(deferred.resolve);
    // mark as overridden so we don't try to override again
    originalOptions[KEY_ALREADY_OVERRIDDEN] = true;
    // override before send on `originalOptions` so that our updated access token will show up
    // in subsequent request if renewed and the ajax call is retried using the `originalOptions`
    originalOptions[KEY_BEFORE_SEND_FN] = this._newBeforeSend.bind(
      this,
      originalOptions[KEY_BEFORE_SEND_FN]
    );
    // save the original error callback for later + if the request fails, try to renew token and
    // call the original error callback only if the retry attempt fails
    if (originalOptions[KEY_ERROR_FN]) {
      originalOptions[KEY_ORIGINAL_ERROR_FN] = originalOptions[KEY_ERROR_FN];
    }
    options[KEY_ERROR_FN] = $.noop();
    xhr.fail(this._newError.bind(this, deferred, originalOptions));
    // return the xhr wrapped in this new deferred object to prevent the original callbacks
    // from immediately firing
    return deferred.promise(xhr);
  },

  _newBeforeSend(originalBeforeSend, xhr, ...otherArgs) {
    PropertyUtils.callIfPresent(originalBeforeSend, [xhr, ...otherArgs]);
    xhr.setRequestHeader(Constants.REQUEST_HEADER.AUTH, this.get('authService.authHeader'));
  },

  _newError(deferred, originalOptions, xhr, ...otherArgs) {
    // if the failure is `UNAUTHORIZED` and we have not already tried to renew the token then retry
    if (
      xhr[KEY_STATUS] === Constants.RESPONSE_STATUS.UNAUTHORIZED &&
      !originalOptions[KEY_ALREADY_RENEWED]
    ) {
      originalOptions[KEY_ALREADY_RENEWED] = true;
      this.tryRenewToken().then(
        // if renewing token is successful, then we resolve or reject based on the second attempt
        () => $.ajax(originalOptions).then(deferred.resolve, deferred.reject),
        // if renewing token fails, then we go ahead and reject with original error
        () => this._rejectWithOriginal(deferred, originalOptions, xhr, otherArgs)
      );
    } else {
      // if we opt not to retry, then we immediately reject with the original error
      this._rejectWithOriginal(deferred, originalOptions, xhr, otherArgs);
    }
  },

  _rejectWithOriginal(deferred, originalOptions, xhr, otherArgs) {
    if (originalOptions[KEY_ORIGINAL_ERROR_FN]) {
      deferred.fail(originalOptions[KEY_ORIGINAL_ERROR_FN]);
    }
    // Ember expects the first argument passed to the error handler to be the xhr object itself
    deferred.rejectWith(xhr, [xhr, ...otherArgs]);
  },
});
