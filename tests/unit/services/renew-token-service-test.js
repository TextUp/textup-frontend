import * as RenewTokenService from 'textup-frontend/services/renew-token-service';
import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleFor, test } from 'ember-qunit';

const { typeOf } = Ember;

moduleFor('service:renew-token-service', 'Unit | Service | renew token service', {
  beforeEach() {
    this.register('service:authService', Ember.Service);
    this.inject.service('authService');
  },
});

test('starting to watch ajax requests', function(assert) {
  const service = this.subject(),
    ajaxPrefilter = sinon.stub(Ember.$, 'ajaxPrefilter').callsArg(0),
    _tryRenewTokenOnError = sinon.stub(service, '_tryRenewTokenOnError');

  service.startWatchingAjaxRequests();

  assert.ok(ajaxPrefilter.calledOnce);
  assert.ok(_tryRenewTokenOnError.calledOnce);
  assert.ok(_tryRenewTokenOnError.alwaysCalledOn(service));

  ajaxPrefilter.restore();
  _tryRenewTokenOnError.restore();
});

test('overridden beforeSend', function(assert) {
  const service = this.subject(),
    originalBeforeSend = sinon.spy(),
    authHeader = Math.random(),
    xhrObj = { setRequestHeader: sinon.spy() },
    arg1 = Math.random(),
    arg2 = Math.random();

  this.authService.setProperties({ authHeader });

  service._newBeforeSend(originalBeforeSend, xhrObj, arg1, arg2);

  assert.ok(originalBeforeSend.calledWith(xhrObj, arg1, arg2));
  assert.ok(xhrObj.setRequestHeader.calledWith(Constants.REQUEST_HEADER.AUTH, authHeader));
});

test('making request to try renew token', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    responseObj = Math.random(),
    refreshToken = Math.random(),
    ajax = sinon.stub(Ember.$, 'ajax');

  this.authService.setProperties({
    refreshToken,
    storeAuthResponseSuccess: sinon.stub().callsArg(1),
  });

  ajax.rejects();
  service
    .tryRenewToken()
    .catch(() => {
      assert.ok(ajax.calledOnce);
      assert.equal(
        ajax.firstCall.args[0][RenewTokenService.KEY_ALREADY_OVERRIDDEN],
        true,
        'to prevent this retry attempt from itself being retried if it fails'
      );
      assert.equal(ajax.firstCall.args[0].type, Constants.REQUEST_METHOD.POST);
      assert.ok(ajax.firstCall.args[0].url.includes(config.host));
      assert.ok(ajax.firstCall.args[0].contentType.includes('application/x-www-form-urlencoded'));
      assert.equal(ajax.firstCall.args[0].data.grant_type, Constants.RESPONSE_KEY.REFRESH_TOKEN);
      assert.equal(ajax.firstCall.args[0].data[Constants.RESPONSE_KEY.REFRESH_TOKEN], refreshToken);
      assert.ok(this.authService.storeAuthResponseSuccess.notCalled);

      ajax.resolves(responseObj);
      return service.tryRenewToken();
    })
    .then(() => {
      assert.ok(ajax.calledTwice);
      assert.ok(this.authService.storeAuthResponseSuccess.calledWith(responseObj));

      ajax.restore();
      done();
    });
});

test('rejecting the deferred with the original error handlers, if present', function(assert) {
  const service = this.subject(),
    originalOpts1 = {},
    originalOpts2 = { [RenewTokenService.KEY_ORIGINAL_ERROR_FN]: sinon.spy() },
    deferred = { fail: sinon.spy(), rejectWith: sinon.spy() },
    xhr = Math.random(),
    arg1 = Math.random(),
    arg2 = Math.random(),
    arg3 = Math.random();

  service._rejectWithOriginal(deferred, originalOpts1, xhr, [arg1, arg2]);
  assert.ok(deferred.fail.notCalled);
  assert.ok(deferred.rejectWith.calledWith(xhr, [xhr, arg1, arg2]));

  service._rejectWithOriginal(deferred, originalOpts2, xhr, [arg3]);
  assert.ok(deferred.fail.calledWith(originalOpts2[RenewTokenService.KEY_ORIGINAL_ERROR_FN]));
  assert.ok(deferred.rejectWith.calledWith(xhr, [xhr, arg3]));
});

test('overridden error handler', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    ajaxPromiseObj = { then: sinon.spy() },
    ajax = sinon.stub(Ember.$, 'ajax').returns(ajaxPromiseObj),
    tryRenewToken = sinon.stub(service, 'tryRenewToken'),
    _rejectWithOriginal = sinon.stub(service, '_rejectWithOriginal'),
    deferredObj = { resolve: sinon.spy(), reject: sinon.spy() },
    arg1 = Math.random(),
    arg2 = Math.random(),
    originalOpts1 = { [Math.random()]: Math.random() },
    originalOpts2 = { [Math.random()]: Math.random() },
    originalOpts3 = { [Math.random()]: Math.random() },
    okXhr = { [RenewTokenService.KEY_STATUS]: Constants.RESPONSE_STATUS.OK },
    unauthorizedXhr = { [RenewTokenService.KEY_STATUS]: Constants.RESPONSE_STATUS.UNAUTHORIZED };

  service._newError(deferredObj, originalOpts1, okXhr, arg1, arg2);
  assert.notOk(originalOpts1[RenewTokenService.KEY_ALREADY_RENEWED]);
  assert.ok(tryRenewToken.notCalled);
  assert.ok(ajax.notCalled);
  assert.ok(_rejectWithOriginal.calledWith(deferredObj, originalOpts1, okXhr, [arg1, arg2]));

  tryRenewToken.rejects();
  service._newError(deferredObj, originalOpts2, unauthorizedXhr, arg1, arg2);
  wait()
    .then(() => {
      assert.equal(
        originalOpts2[RenewTokenService.KEY_ALREADY_RENEWED],
        true,
        "set already renewed flag to true so we don't do it multiple times"
      );
      assert.ok(tryRenewToken.calledOnce);
      assert.ok(ajax.notCalled);
      assert.ok(
        _rejectWithOriginal.calledWith(deferredObj, originalOpts2, unauthorizedXhr, [arg1, arg2])
      );

      tryRenewToken.resolves();
      service._newError(deferredObj, originalOpts3, unauthorizedXhr, arg1, arg2);
      return wait();
    })
    .then(() => {
      assert.equal(
        originalOpts3[RenewTokenService.KEY_ALREADY_RENEWED],
        true,
        "set already renewed flag to true so we don't do it multiple times"
      );
      assert.ok(tryRenewToken.calledTwice);
      assert.ok(ajax.calledWith(originalOpts3));
      assert.ok(
        ajaxPromiseObj.then.calledWith(deferredObj.resolve, deferredObj.reject),
        'resolve or reject the deferred object wrapping the original xhr based on this outcome of the second attempt'
      );
      assert.notOk(
        _rejectWithOriginal.calledWith(deferredObj, originalOpts3, unauthorizedXhr, [arg1, arg2]),
        "if we're retrying then don't call the original error anymore, just handle the outcome of the second attempt"
      );

      _rejectWithOriginal.restore();
      tryRenewToken.restore();
      ajax.restore();
      done();
    });
});

test('overriding handlers to try to renew token on error', function(assert) {
  const service = this.subject(),
    refreshToken = Math.random(),
    retVal = Math.random(),
    deferredObj = { resolve: sinon.spy(), promise: sinon.stub().returns(retVal) },
    Deferred = sinon.stub(Ember.$, 'Deferred').returns(deferredObj),
    xhr = { done: sinon.spy(), fail: sinon.spy() },
    originalBeforeSend = sinon.spy(),
    options = {},
    originalOptions1 = { [RenewTokenService.KEY_ALREADY_OVERRIDDEN]: true },
    originalOptions2 = {
      [RenewTokenService.KEY_ERROR_FN]: sinon.spy(),
      [RenewTokenService.KEY_BEFORE_SEND_FN]: originalBeforeSend,
    },
    _newBeforeSend = sinon.stub(service, '_newBeforeSend'),
    _newError = sinon.stub(service, '_newError');

  this.authService.setProperties({ refreshToken });
  assert.notOk(
    service._tryRenewTokenOnError(options, originalOptions1, xhr),
    'short circuit even with refreshToken because already overridden'
  );
  assert.ok(Deferred.notCalled);
  assert.ok(xhr.done.notCalled);
  assert.ok(xhr.fail.notCalled);
  assert.notOk(options[RenewTokenService.KEY_ERROR_FN]);

  this.authService.setProperties({ refreshToken: null });
  assert.notOk(
    service._tryRenewTokenOnError(options, originalOptions2, xhr),
    'short circuits even though not overridden because no refresh token'
  );
  assert.notOk(options[RenewTokenService.KEY_ERROR_FN]);
  assert.notOk(originalOptions2[RenewTokenService.KEY_ALREADY_OVERRIDDEN]);
  assert.ok(Deferred.notCalled);
  assert.ok(xhr.done.notCalled);
  assert.ok(xhr.fail.notCalled);

  this.authService.setProperties({ refreshToken });
  assert.equal(
    service._tryRenewTokenOnError(options, originalOptions2, xhr),
    retVal,
    'will override because not already overridden and has refresh token'
  );
  assert.ok(Deferred.calledOnce);
  assert.ok(xhr.done.calledWith(deferredObj.resolve));
  assert.equal(originalOptions2[RenewTokenService.KEY_ALREADY_OVERRIDDEN], true);
  assert.equal(typeOf(originalOptions2[RenewTokenService.KEY_BEFORE_SEND_FN]), 'function');
  assert.equal(
    originalOptions2[RenewTokenService.KEY_ORIGINAL_ERROR_FN],
    originalOptions2[RenewTokenService.KEY_ERROR_FN],
    'save error function under a different key just in case'
  );
  assert.deepEqual(options[RenewTokenService.KEY_ERROR_FN], Ember.$.noop());
  assert.ok(xhr.fail.calledOnce);
  assert.ok(deferredObj.promise.calledWith(xhr));

  assert.ok(_newBeforeSend.notCalled);
  assert.ok(_newError.notCalled);

  originalOptions2[RenewTokenService.KEY_BEFORE_SEND_FN].call();
  assert.ok(_newBeforeSend.calledWith(originalBeforeSend));
  assert.ok(_newBeforeSend.alwaysCalledOn(service));
  assert.ok(_newError.notCalled);

  xhr.fail.firstCall.args[0].call();
  assert.ok(_newBeforeSend.calledOnce);
  assert.ok(_newError.calledWith(deferredObj, originalOptions2));
  assert.ok(_newError.alwaysCalledOn(service));

  Deferred.restore();
  _newBeforeSend.restore();
  _newError.restore();
});
