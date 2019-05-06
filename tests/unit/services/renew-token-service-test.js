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
      assert.equal(ajax.firstCall.args[0][RenewTokenService.KEY_ALREADY_OVERRIDEN], true);
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

test('overridden error handler', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    ajax = sinon.stub(Ember.$, 'ajax'),
    tryRenewToken = sinon.stub(service, 'tryRenewToken'),
    arg1 = Math.random(),
    arg2 = Math.random(),
    originalOpts1 = { [RenewTokenService.KEY_ERROR_FN]: sinon.spy() },
    originalOpts2 = { [RenewTokenService.KEY_ERROR_FN]: sinon.spy() },
    originalOpts3 = { [RenewTokenService.KEY_ERROR_FN]: sinon.spy() },
    okXhr = { [RenewTokenService.KEY_STATUS]: Constants.RESPONSE_STATUS.OK },
    unauthorizedXhr = { [RenewTokenService.KEY_STATUS]: Constants.RESPONSE_STATUS.UNAUTHORIZED };

  service._newError(originalOpts1, okXhr, arg1, arg2);
  assert.ok(tryRenewToken.notCalled);
  assert.ok(ajax.notCalled);
  assert.ok(originalOpts1[RenewTokenService.KEY_ERROR_FN].calledWith(okXhr, arg1, arg2));

  tryRenewToken.rejects();
  service._newError(originalOpts2, unauthorizedXhr, arg1, arg2);
  wait()
    .then(() => {
      assert.ok(tryRenewToken.calledOnce);
      assert.ok(ajax.notCalled);
      assert.ok(
        originalOpts2[RenewTokenService.KEY_ERROR_FN].calledWith(unauthorizedXhr, arg1, arg2)
      );
      assert.equal(
        originalOpts2[RenewTokenService.KEY_ALREADY_RENEWED],
        true,
        "set already renewed flag to true so we don't do it multiple times"
      );

      tryRenewToken.resolves();
      service._newError(originalOpts3, unauthorizedXhr, arg1, arg2);
      return wait();
    })
    .then(() => {
      assert.ok(tryRenewToken.calledTwice);
      assert.ok(ajax.calledWith(originalOpts3));
      assert.ok(originalOpts3[RenewTokenService.KEY_ERROR_FN].notCalled);

      tryRenewToken.restore();
      ajax.restore();
      done();
    });
});

test('overriding handlers to try to renew token on error', function(assert) {
  const service = this.subject(),
    token = Math.random(),
    refreshToken = Math.random(),
    originalBeforeSend = sinon.spy(),
    options = {},
    originalOptions1 = {},
    originalOptions2 = {
      [RenewTokenService.KEY_ALREADY_OVERRIDEN]: false,
      [RenewTokenService.KEY_ERROR_FN]: sinon.spy(),
      [RenewTokenService.KEY_BEFORE_SEND_FN]: originalBeforeSend,
    },
    _newBeforeSend = sinon.stub(service, '_newBeforeSend'),
    _newError = sinon.stub(service, '_newError');

  service._tryRenewTokenOnError(options, originalOptions1);
  assert.notOk(options[RenewTokenService.KEY_ERROR_FN]);
  assert.notOk(originalOptions1[RenewTokenService.KEY_ALREADY_OVERRIDEN]);

  this.authService.setProperties({ token: null, refreshToken: null });
  service._tryRenewTokenOnError(options, originalOptions2);
  assert.notOk(options[RenewTokenService.KEY_ERROR_FN], 'still short circuits because no tokens');
  assert.notOk(originalOptions2[RenewTokenService.KEY_ALREADY_OVERRIDEN]);

  this.authService.setProperties({ token, refreshToken });
  service._tryRenewTokenOnError(options, originalOptions2);
  assert.equal(originalOptions2[RenewTokenService.KEY_ALREADY_OVERRIDEN], true);
  assert.equal(typeOf(options[RenewTokenService.KEY_ERROR_FN]), 'function');
  assert.equal(typeOf(originalOptions2[RenewTokenService.KEY_BEFORE_SEND_FN]), 'function');
  assert.ok(_newBeforeSend.notCalled);
  assert.ok(_newError.notCalled);

  options[RenewTokenService.KEY_ERROR_FN].call();
  assert.ok(_newBeforeSend.notCalled);
  assert.ok(_newError.calledWith(originalOptions2));
  assert.ok(_newError.alwaysCalledOn(service));

  originalOptions2[RenewTokenService.KEY_BEFORE_SEND_FN].call();
  assert.ok(_newBeforeSend.calledWith(originalBeforeSend));
  assert.ok(_newBeforeSend.alwaysCalledOn(service));
  assert.ok(_newError.calledOnce);

  _newBeforeSend.restore();
  _newError.restore();
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
