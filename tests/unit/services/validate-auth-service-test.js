import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import sinon from 'sinon';
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:validate-auth-service', 'Unit | Service | validate auth service', {
  beforeEach() {
    this.register('service:requestService', Ember.Service);
    this.inject.service('requestService');
  },
});

test('validating password', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    username = Math.random(),
    password = Math.random(),
    then1 = sinon.spy(),
    then2 = sinon.spy();

  this.requestService.setProperties({ authRequest: sinon.stub() });

  this.requestService.authRequest.rejects();
  service
    .checkPassword()
    .catch(() => {
      assert.ok(this.requestService.authRequest.notCalled);

      return service.checkPassword(username, password, then1, then2);
    })
    .catch(() => {
      assert.ok(this.requestService.authRequest.calledOnce);
      assert.equal(
        this.requestService.authRequest.firstCall.args[0].type,
        Constants.REQUEST_METHOD.POST
      );
      assert.ok(this.requestService.authRequest.firstCall.args[0].url.includes(config.host));
      assert.ok(this.requestService.authRequest.firstCall.args[0].data.includes(username));
      assert.ok(this.requestService.authRequest.firstCall.args[0].data.includes(password));
      assert.ok(then1.notCalled);
      assert.ok(then2.notCalled);

      this.requestService.authRequest.resolves();
      return service.checkPassword(username, password, then1, then2);
    })
    .then(() => {
      assert.ok(this.requestService.authRequest.calledTwice);
      assert.ok(then1.calledOnce);
      assert.ok(then2.calledOnce);

      done();
    });
});

test('validating lock code', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    username = Math.random(),
    lockCode = Math.random();

  this.requestService.setProperties({ authRequest: sinon.stub() });

  this.requestService.authRequest.rejects();
  service
    .checkLockCode()
    .catch(() => {
      assert.ok(this.requestService.authRequest.notCalled);

      return service.checkLockCode(username, lockCode);
    })
    .catch(() => {
      assert.ok(this.requestService.authRequest.calledOnce);
      assert.equal(
        this.requestService.authRequest.firstCall.args[0].type,
        Constants.REQUEST_METHOD.POST
      );
      assert.ok(this.requestService.authRequest.firstCall.args[0].url.includes(config.host));
      assert.ok(this.requestService.authRequest.firstCall.args[0].data.includes(username));
      assert.ok(this.requestService.authRequest.firstCall.args[0].data.includes(lockCode));

      this.requestService.authRequest.resolves();
      return service.checkLockCode(username, lockCode);
    })
    .then(() => {
      assert.ok(this.requestService.authRequest.calledTwice);

      done();
    });
});
