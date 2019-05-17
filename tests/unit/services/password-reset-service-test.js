import * as PasswordResetService from 'textup-frontend/services/password-reset-service';
import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import sinon from 'sinon';
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:password-reset-service', 'Unit | Service | password reset service', {
  beforeEach() {
    this.register('service:notification-messages-service', Ember.Service);
    this.inject.service('notification-messages-service', { as: 'notifications' });
    this.register('service:requestService', Ember.Service);
    this.inject.service('requestService');
  },
});

test('getting password reset token', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    username = Math.random(),
    ajax = sinon.stub(Ember.$, 'ajax').resolves();

  this.requestService.setProperties({ handleIfError: sinon.stub().returnsArg(0) });
  this.notifications.setProperties({ success: sinon.spy() });

  service
    .getToken(null)
    .catch(() => {
      assert.ok(this.requestService.handleIfError.notCalled);
      assert.ok(ajax.notCalled);
      assert.ok(this.notifications.success.notCalled);

      return service.getToken(username);
    })
    .then(() => {
      assert.ok(this.requestService.handleIfError.calledOnce);
      assert.ok(ajax.calledOnce);
      assert.equal(ajax.firstCall.args[0].type, Constants.REQUEST_METHOD.POST);
      assert.ok(ajax.firstCall.args[0].url.includes(config.host));
      assert.equal(ajax.firstCall.args[0].contentType, Constants.MIME_TYPE.JSON);
      assert.ok(ajax.firstCall.args[0].data.includes(username));
      assert.ok(this.notifications.success.calledWith(PasswordResetService.GET_TOKEN_SUCCESS_MSG));

      ajax.restore();
      done();
    });
});

test('resetting password with token', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    token = Math.random(),
    password = Math.random(),
    ajax = sinon.stub(Ember.$, 'ajax').resolves();

  this.requestService.setProperties({ handleIfError: sinon.stub().returnsArg(0) });
  this.notifications.setProperties({ success: sinon.spy() });

  service
    .updatePasswordWithToken(null, null)
    .catch(() => {
      assert.ok(this.requestService.handleIfError.notCalled);
      assert.ok(ajax.notCalled);
      assert.ok(this.notifications.success.notCalled);

      return service.updatePasswordWithToken(token, password);
    })
    .then(() => {
      assert.ok(this.requestService.handleIfError.calledOnce);
      assert.ok(ajax.calledOnce);
      assert.equal(ajax.firstCall.args[0].type, Constants.REQUEST_METHOD.PUT);
      assert.ok(ajax.firstCall.args[0].url.includes(config.host));
      assert.ok(ajax.firstCall.args[0].url.includes(token), 'token is in the url');
      assert.equal(ajax.firstCall.args[0].contentType, Constants.MIME_TYPE.JSON);
      assert.ok(ajax.firstCall.args[0].data.includes(password));
      assert.ok(
        this.notifications.success.calledWith(PasswordResetService.RESET_PASSWORD_SUCCESS_MSG)
      );

      ajax.restore();
      done();
    });
});
