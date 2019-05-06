import * as LockService from 'textup-frontend/services/lock-service';
import AppUtils from 'textup-frontend/utils/app';
import config from 'textup-frontend/config/environment';
import Ember from 'ember';
import sinon from 'sinon';
import StorageUtils from 'textup-frontend/utils/storage';
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:lock-service', 'Unit | Service | lock service', {
  beforeEach() {
    this.register('service:authService', Ember.Service);
    this.inject.service('authService');
    this.register('service:notifications', Ember.Service);
    this.inject.service('notifications');
    this.register('service:storageService', Ember.Service);
    this.inject.service('storageService');
    this.register('service:validateAuthService', Ember.Service);
    this.inject.service('validateAuthService');
  },
});

test('aliased readonly properties', function(assert) {
  const service = this.subject(),
    timeout = Math.random(),
    authName = Math.random(),
    isLocked = Math.random();

  assert.notOk(service.get('timeout'));
  assert.notOk(service.get('authName'));
  assert.notOk(service.get('isLocked'));

  this.authService.setProperties({ authUser: { name: authName, org: { content: { timeout } } } });
  service.set('lockContainer', { isLocked });

  assert.equal(service.get('timeout'), timeout);
  assert.equal(service.get('authName'), authName);
  assert.equal(service.get('isLocked'), isLocked);

  assert.throws(() => service.set('timeout'), 'is read-only');
  assert.throws(() => service.set('authName'), 'is read-only');
  assert.throws(() => service.set('isLocked'), 'is read-only');
});

test('resetting and logging out', function(assert) {
  const service = this.subject(),
    lockContainerObj = { actions: { unlock: sinon.spy() } };

  this.authService.setProperties({ logout: sinon.spy() });
  service.set('lockContainer', lockContainerObj);

  service.resetAndLogOut();

  assert.ok(this.authService.logout.calledOnce);
  assert.ok(lockContainerObj.actions.unlock.calledOnce);
});

test('getting number of attempts from storage', function(assert) {
  const service = this.subject();

  this.storageService.setProperties({ getItem: sinon.stub() });

  this.storageService.getItem.withArgs(StorageUtils.numAttemptsKey()).returns('hi');
  assert.equal(service._getAttempts(), 0);

  this.storageService.getItem.withArgs(StorageUtils.numAttemptsKey()).returns(88);
  assert.equal(service._getAttempts(), 88);
});

test('incrementing number of attempts', function(assert) {
  const service = this.subject(),
    _getAttempts = sinon.stub(service, '_getAttempts').returns(87);

  this.storageService.setProperties({ setItem: sinon.spy() });

  service._incrementAttempts();
  assert.ok(this.storageService.setItem.calledWith(StorageUtils.numAttemptsKey(), 88));

  _getAttempts.restore();
});

test('resetting number of attempts', function(assert) {
  const service = this.subject();

  this.storageService.setProperties({ setItem: sinon.spy() });

  service._resetAttempts();
  assert.ok(this.storageService.setItem.calledWith(StorageUtils.numAttemptsKey(), 0));
});

test('recording one more attempt', function(assert) {
  const service = this.subject(),
    _incrementAttempts = sinon.stub(service, '_incrementAttempts'),
    _getAttempts = sinon.stub(service, '_getAttempts'),
    _resetAttempts = sinon.stub(service, '_resetAttempts'),
    resetAndLogOut = sinon.stub(service, 'resetAndLogOut');

  _getAttempts.returns(config.lock.maxNumAttempts - 1);
  service._recordOneMoreAttempt();
  assert.ok(_incrementAttempts.calledOnce);
  assert.ok(_getAttempts.calledOnce);
  assert.ok(_resetAttempts.notCalled);
  assert.ok(resetAndLogOut.notCalled);

  _getAttempts.returns(config.lock.maxNumAttempts + 1);
  service._recordOneMoreAttempt();
  assert.ok(_incrementAttempts.calledTwice);
  assert.ok(_getAttempts.calledTwice);
  assert.ok(_resetAttempts.calledOnce);
  assert.ok(resetAndLogOut.calledOnce);

  _incrementAttempts.restore();
  _getAttempts.restore();
  _resetAttempts.restore();
  resetAndLogOut.restore();
});

test('verifying lock code fail', function(assert) {
  const service = this.subject(),
    _recordOneMoreAttempt = sinon.stub(service, '_recordOneMoreAttempt'),
    rejectFn = sinon.spy();

  this.notifications.setProperties({ error: sinon.spy() });

  service._onVerifyFail(rejectFn);

  assert.ok(this.notifications.error.calledWith(LockService.VERIFY_FAIL_MESSAGE));
  assert.ok(_recordOneMoreAttempt.calledOnce);
  assert.ok(rejectFn.calledOnce);

  _recordOneMoreAttempt.restore();
});

test('verifying lock code success', function(assert) {
  const service = this.subject(),
    _resetAttempts = sinon.stub(service, '_resetAttempts'),
    resolveFn = sinon.spy();

  this.notifications.setProperties({ clearAll: sinon.spy() });

  service._onVerifySuccess(resolveFn);

  assert.ok(this.notifications.clearAll.calledOnce);
  assert.ok(_resetAttempts.calledOnce);
  assert.ok(resolveFn.calledOnce);

  _resetAttempts.restore();
});

test('determining if should lock given route name', function(assert) {
  const service = this.subject();

  assert.equal(service._shouldLockForRouteName(null), false);
  assert.equal(service._shouldLockForRouteName(['not a string']), false);
  assert.equal(service._shouldLockForRouteName('should-lock-route-name'), true);
  assert.equal(service._shouldLockForRouteName(config.lock.ignoreLockRouteNames[0]), false);
});

test('checking if should lock', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    routeName1 = Math.random(),
    routeName2 = Math.random(),
    _shouldLockForRouteName = sinon.stub(service, '_shouldLockForRouteName');

  _shouldLockForRouteName.returns(true);
  service
    .onCheckShouldLock(routeName1)
    .then(() => {
      assert.ok(_shouldLockForRouteName.calledWith(routeName1));

      _shouldLockForRouteName.returns(false);
      return service.onCheckShouldLock(routeName2);
    })
    .catch(() => {
      assert.ok(_shouldLockForRouteName.calledWith(routeName2));

      _shouldLockForRouteName.restore();
      done();
    });
});

test('checking if should start locked', function(assert) {
  const service = this.subject(),
    routeName = Math.random(),
    retVal = Math.random(),
    _shouldLockForRouteName = sinon.stub(service, '_shouldLockForRouteName').returns(retVal);

  assert.equal(service.get('shouldStartLocked'), true, 'default for starting locked is true');

  service.checkIfShouldStartLocked(routeName);
  assert.ok(_shouldLockForRouteName.calledWith(routeName));
  assert.equal(service.get('shouldStartLocked'), retVal);

  _shouldLockForRouteName.restore();
});

test('syncing lock status with transition', function(assert) {
  const service = this.subject(),
    abortTransition = sinon.stub(AppUtils, 'abortTransition'),
    _shouldLockForRouteName = sinon.stub(service, '_shouldLockForRouteName'),
    targetName = Math.random() + '',
    transitionObj = Ember.Object.create({ abort: sinon.spy(), targetName }),
    lockContainerObj = { isLocked: false, actions: { unlock: sinon.spy(), lock: sinon.spy() } };

  service.set('lockContainer', lockContainerObj);

  service.syncLockStatusWithTransition(null);

  assert.ok(_shouldLockForRouteName.notCalled, 'must pass in a transition object');

  Ember.set(lockContainerObj, 'isLocked', false);
  _shouldLockForRouteName.withArgs(targetName).returns(false);
  service.syncLockStatusWithTransition(transitionObj);

  assert.equal(_shouldLockForRouteName.callCount, 1);
  assert.ok(abortTransition.notCalled);
  assert.ok(lockContainerObj.actions.unlock.notCalled);
  assert.ok(lockContainerObj.actions.lock.notCalled);

  Ember.set(lockContainerObj, 'isLocked', false);
  _shouldLockForRouteName.withArgs(targetName).returns(true);
  service.syncLockStatusWithTransition(transitionObj);

  assert.equal(_shouldLockForRouteName.callCount, 2);
  assert.ok(abortTransition.notCalled);
  assert.ok(lockContainerObj.actions.unlock.notCalled);
  assert.ok(lockContainerObj.actions.lock.calledOnce);

  Ember.set(lockContainerObj, 'isLocked', true);
  _shouldLockForRouteName.withArgs(targetName).returns(false);
  service.syncLockStatusWithTransition(transitionObj);

  assert.equal(_shouldLockForRouteName.callCount, 3);
  assert.ok(abortTransition.notCalled);
  assert.ok(lockContainerObj.actions.unlock.calledOnce);
  assert.ok(lockContainerObj.actions.lock.calledOnce);

  Ember.set(lockContainerObj, 'isLocked', true);
  _shouldLockForRouteName.withArgs(targetName).returns(true);
  service.syncLockStatusWithTransition(transitionObj);

  assert.equal(_shouldLockForRouteName.callCount, 4);
  assert.ok(abortTransition.calledOnce);
  assert.ok(lockContainerObj.actions.unlock.calledOnce);
  assert.ok(lockContainerObj.actions.lock.calledOnce);

  abortTransition.restore();
  _shouldLockForRouteName.restore();
});

test('verifying lock code', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    username = Math.random(),
    lockCode = Math.random(),
    _onVerifySuccess = sinon.stub(service, '_onVerifySuccess').callsArg(0),
    _onVerifyFail = sinon.stub(service, '_onVerifyFail').callsArg(0);

  this.authService.setProperties({ authUser: { username } });
  this.validateAuthService.setProperties({ checkLockCode: sinon.stub() });

  service.setProperties({ lockCode });
  this.validateAuthService.checkLockCode.rejects();
  service
    .verifyLockCode()
    .catch(() => {
      assert.ok(this.validateAuthService.checkLockCode.calledOnce);
      assert.ok(this.validateAuthService.checkLockCode.firstCall.calledWith(username, lockCode));
      assert.ok(_onVerifySuccess.notCalled);
      assert.ok(_onVerifyFail.calledOnce);
      assert.notOk(service.get('lockCode'), 'lock code is cleared');

      service.setProperties({ lockCode });
      this.validateAuthService.checkLockCode.resolves();
      return service.verifyLockCode();
    })
    .then(() => {
      assert.ok(this.validateAuthService.checkLockCode.calledTwice);
      assert.ok(this.validateAuthService.checkLockCode.secondCall.calledWith(username, lockCode));
      assert.ok(_onVerifySuccess.calledOnce);
      assert.ok(_onVerifyFail.calledOnce);
      assert.notOk(service.get('lockCode'), 'lock code is cleared');

      _onVerifySuccess.restore();
      _onVerifyFail.restore();
      done();
    });
});
