import * as AuthService from 'textup-frontend/services/auth-service';
import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import LocaleUtils from 'textup-frontend/utils/locale';
import sinon from 'sinon';
import StorageUtils from 'textup-frontend/utils/storage';
import TestUtils from 'textup-frontend/tests/helpers/utilities';
import wait from 'ember-test-helpers/wait';
import { moduleFor, test } from 'ember-qunit';

const { run } = Ember;

moduleFor('service:auth-service', 'Unit | Service | auth service', {
  needs: ['service:analytics'],
  beforeEach() {
    this.register('service:notification-messages-service', Ember.Service);
    this.inject.service('notification-messages-service', { as: 'notifications' });
    this.register('service:requestService', Ember.Service);
    this.inject.service('requestService');
    this.register('service:router', Ember.Service);
    this.inject.service('router');
    this.register('service:storageService', Ember.Service.extend({ off: sinon.spy() }));
    this.inject.service('storageService');
    this.register('service:store', Ember.Service);
    this.inject.service('store');
  },
});

test('is logged in property', function(assert) {
  const service = this.subject();

  assert.equal(service.get('isLoggedIn'), false);

  service.setProperties({ token: Math.random(), authUser: Math.random() });
  assert.equal(service.get('isLoggedIn'), true);
});

test('building auth header value', function(assert) {
  const service = this.subject(),
    token = Math.random();

  service.setProperties({ token });

  assert.ok(service.get('authHeader').includes('Bearer'));
  assert.ok(service.get('authHeader').includes(token));
});

test('storing auth data + triggering event', function(assert) {
  const service = this.subject(),
    token1 = Math.random(),
    refreshToken1 = Math.random(),
    token2 = Math.random(),
    refreshToken2 = Math.random(),
    token3 = Math.random(),
    refreshToken3 = Math.random(),
    notStaffObj = TestUtils.mockModel(88, Constants.MODEL.TEAM),
    staffObj = TestUtils.mockModel(88, Constants.MODEL.STAFF),
    onSuccess = sinon.spy();

  this.storageService.setProperties({ setItem: sinon.spy(), sendStorageToOtherTabs: sinon.spy() });
  service.on(config.events.auth.success, onSuccess);

  service._storeAuthData(token1, refreshToken1);
  assert.ok(this.storageService.setItem.calledWith(StorageUtils.authTokenKey(), token1));
  assert.ok(
    this.storageService.setItem.calledWith(StorageUtils.authRefreshTokenKey(), refreshToken1)
  );
  assert.equal(service.get('token'), token1);
  assert.equal(service.get('refreshToken'), refreshToken1);
  assert.notOk(service.get('authUser'));
  assert.ok(this.storageService.sendStorageToOtherTabs.notCalled);
  assert.ok(onSuccess.notCalled);

  service._storeAuthData(token2, refreshToken2, notStaffObj);
  assert.ok(this.storageService.setItem.calledWith(StorageUtils.authTokenKey(), token2));
  assert.ok(
    this.storageService.setItem.calledWith(StorageUtils.authRefreshTokenKey(), refreshToken2)
  );
  assert.equal(service.get('token'), token2);
  assert.equal(service.get('refreshToken'), refreshToken2);
  assert.notOk(service.get('authUser'));
  assert.ok(this.storageService.sendStorageToOtherTabs.notCalled);
  assert.ok(onSuccess.notCalled);

  service._storeAuthData(token3, refreshToken3, staffObj);
  assert.ok(this.storageService.setItem.calledWith(StorageUtils.authTokenKey(), token3));
  assert.ok(
    this.storageService.setItem.calledWith(StorageUtils.authRefreshTokenKey(), refreshToken3)
  );
  assert.ok(
    this.storageService.setItem.calledWith(StorageUtils.authUserIdKey(), staffObj.get('id'))
  );
  assert.equal(service.get('token'), token3);
  assert.equal(service.get('refreshToken'), refreshToken3);
  assert.equal(service.get('authUser'), staffObj);
  assert.ok(this.storageService.sendStorageToOtherTabs.calledOnce);
  assert.ok(onSuccess.calledOnce);
});

test('clearing auth data + triggering event', function(assert) {
  const service = this.subject(),
    rejectFn = sinon.spy(),
    onClear = sinon.spy();

  this.storageService.setProperties({
    removeItem: sinon.spy(),
    sendStorageToOtherTabs: sinon.spy(),
  });
  service.on(config.events.auth.clear, onClear);

  service._clearAuthData(rejectFn);
  assert.ok(this.storageService.removeItem.calledWith(StorageUtils.authTokenKey()));
  assert.ok(this.storageService.removeItem.calledWith(StorageUtils.authRefreshTokenKey()));
  assert.ok(this.storageService.removeItem.calledWith(StorageUtils.authUserIdKey()));
  assert.equal(service.get('token'), null);
  assert.equal(service.get('refreshToken'), null);
  assert.equal(service.get('authUser'), null);
  assert.ok(this.storageService.sendStorageToOtherTabs.calledOnce);
  assert.ok(onClear.calledOnce);
  assert.ok(rejectFn.calledOnce);
});

test('setting up from stored data', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    token = Math.random(),
    refreshToken = Math.random(),
    userId = Math.random(),
    staffObj = TestUtils.mockModel(88, Constants.MODEL.STAFF),
    _clearAuthData = sinon.stub(service, '_clearAuthData').callsArg(0),
    _storeAuthData = sinon.stub(service, '_storeAuthData');

  this.storageService.setProperties({ getItem: sinon.stub(), isItemPersistent: sinon.stub() });
  this.store.setProperties({ findRecord: sinon.stub() });

  service
    ._setUpFromStorage()
    .catch(() => {
      assert.ok(this.storageService.getItem.callCount, 3);
      assert.notOk(this.storageService.get('persistBetweenSessions'));
      assert.notOk(service.get('token'));
      assert.notOk(service.get('refreshToken'));
      assert.ok(this.storageService.isItemPersistent.notCalled);
      assert.ok(this.store.findRecord.notCalled);
      assert.ok(_storeAuthData.notCalled);
      assert.ok(_clearAuthData.calledOnce);

      this.storageService.getItem.withArgs(StorageUtils.authTokenKey()).returns(token);
      this.storageService.getItem
        .withArgs(StorageUtils.authRefreshTokenKey())
        .returns(refreshToken);
      this.storageService.getItem.withArgs(StorageUtils.authUserIdKey()).returns(userId);
      this.storageService.isItemPersistent.withArgs(StorageUtils.authTokenKey()).returns(true);
      this.store.findRecord.rejects();
      return service._setUpFromStorage();
    })
    .catch(() => {
      assert.ok(this.storageService.getItem.callCount, 6);
      assert.ok(this.store.findRecord.calledOnce);
      assert.ok(_storeAuthData.notCalled);
      assert.ok(_clearAuthData.calledTwice);

      this.store.findRecord.resolves(staffObj);
      return service._setUpFromStorage();
    })
    .then(() => {
      assert.ok(this.storageService.getItem.callCount, 9);
      assert.equal(this.storageService.get('persistBetweenSessions'), true);
      assert.equal(service.get('token'), token);
      assert.equal(service.get('refreshToken'), refreshToken);
      assert.ok(this.storageService.isItemPersistent.calledWith(StorageUtils.authTokenKey()));
      assert.ok(this.store.findRecord.calledWith(Constants.MODEL.STAFF, userId));
      assert.ok(_storeAuthData.calledWith(token, refreshToken, staffObj));
      assert.ok(_clearAuthData.calledTwice);

      _clearAuthData.restore();
      _storeAuthData.restore();
      done();
    });
});

test('logging out', function(assert) {
  const service = this.subject(),
    _clearAuthData = sinon.stub(service, '_clearAuthData');

  this.store.setProperties({ unloadAll: sinon.spy() });
  this.router.setProperties({ transitionTo: sinon.spy() });

  service.logout();
  assert.ok(_clearAuthData.calledOnce);
  assert.ok(_clearAuthData.calledWith());
  assert.ok(this.store.unloadAll.calledOnce);
  assert.ok(this.router.transitionTo.calledWith('index'));

  _clearAuthData.restore();
});

test('when successfully set up from storage change event', function(assert) {
  const service = this.subject(),
    authUser = Math.random();

  this.router.setProperties({ transitionTo: sinon.spy() });
  service.setProperties({ authUser });

  service._storageChangeSetUpSuccess(true);
  assert.ok(this.router.transitionTo.notCalled, 'no need to transition because already logged in');

  service._storageChangeSetUpSuccess(false);
  assert.ok(this.router.transitionTo.calledWith('main', authUser));
});

test('handling storage change event', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    token1 = Math.random(),
    token2 = Math.random(),
    _setUpFromStorage = sinon.stub(service, '_setUpFromStorage'),
    _storageChangeSetUpSuccess = sinon.stub(service, '_storageChangeSetUpSuccess'),
    logout = sinon.stub(service, 'logout');

  this.storageService.setProperties({ getItem: sinon.stub() });
  service.setProperties({ token: token1, isLoggedIn: true });

  this.storageService.getItem.withArgs(StorageUtils.authTokenKey()).returns(token1);
  service._handleStorageChange();
  wait()
    .then(() => {
      assert.ok(_setUpFromStorage.notCalled);
      assert.ok(_storageChangeSetUpSuccess.notCalled);
      assert.ok(logout.notCalled);

      this.storageService.getItem.withArgs(StorageUtils.authTokenKey()).returns(null);
      service._handleStorageChange();
      return wait();
    })
    .then(() => {
      assert.ok(_setUpFromStorage.notCalled);
      assert.ok(_storageChangeSetUpSuccess.notCalled);
      assert.ok(logout.calledOnce);

      this.storageService.getItem.withArgs(StorageUtils.authTokenKey()).returns(token2);
      _setUpFromStorage.rejects();
      service._handleStorageChange();
      return wait();
    })
    .then(() => {
      assert.ok(_setUpFromStorage.calledOnce);
      assert.ok(_storageChangeSetUpSuccess.notCalled);
      assert.ok(logout.calledTwice);

      this.storageService.getItem.withArgs(StorageUtils.authTokenKey()).returns(token2);
      _setUpFromStorage.resolves();
      service._handleStorageChange();
      return wait();
    })
    .then(() => {
      assert.ok(_setUpFromStorage.calledTwice);
      assert.ok(_storageChangeSetUpSuccess.calledWith(true));
      assert.ok(logout.calledTwice);

      _setUpFromStorage.restore();
      _storageChangeSetUpSuccess.restore();
      logout.restore();
      done();
    });
});

test('storing + retrying attempting transition', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    transitionObj = { retry: sinon.spy() };

  assert.notOk(service.get('_attemptedTransition'));

  service
    ._retryAttemptedTransitionAfterLogIn()
    .then(() => {
      assert.ok(transitionObj.retry.notCalled);
      assert.notOk(service.get('_attemptedTransition'));

      service.storeAttemptedTransition(transitionObj);
      assert.equal(service.get('_attemptedTransition'), transitionObj);

      return service._retryAttemptedTransitionAfterLogIn();
    })
    .then(() => {
      assert.ok(transitionObj.retry.calledOnce);
      assert.notOk(service.get('_attemptedTransition'));

      done();
    });
});

test('storing successful data from success auth request', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    _storeAuthData = sinon.stub(service, '_storeAuthData'),
    _retryAttemptedTransitionAfterLogIn = sinon
      .stub(service, '_retryAttemptedTransitionAfterLogIn')
      .resolves(),
    staffObj1 = Math.random(),
    staffObj2 = Math.random(),
    staffObj3 = Math.random(),
    token = Math.random(),
    refreshToken = Math.random(),
    resolveFn = sinon.spy();

  this.store.setProperties({
    normalize: sinon.stub().returns(staffObj2),
    push: sinon.stub().returns(staffObj3),
  });

  service.storeAuthResponseSuccess('not an object');
  assert.ok(this.store.normalize.notCalled);
  assert.ok(this.store.push.notCalled);
  assert.ok(_storeAuthData.notCalled);
  assert.ok(_retryAttemptedTransitionAfterLogIn.notCalled);
  assert.ok(resolveFn.notCalled);

  service.storeAuthResponseSuccess(
    {
      [Constants.MODEL.STAFF]: staffObj1,
      [Constants.RESPONSE_KEY.ACCESS_TOKEN]: token,
      [Constants.RESPONSE_KEY.REFRESH_TOKEN]: refreshToken,
    },
    resolveFn
  );
  assert.ok(this.store.normalize.calledWith(Constants.MODEL.STAFF, staffObj1));
  assert.ok(this.store.push.calledWith(staffObj2));
  assert.ok(_storeAuthData.calledWith(token, refreshToken, staffObj3));
  assert.ok(_retryAttemptedTransitionAfterLogIn.calledOnce);

  wait().then(() => {
    assert.ok(resolveFn.calledWith(staffObj3));

    _storeAuthData.restore();
    _retryAttemptedTransitionAfterLogIn.restore();
    done();
  });
});

test('logging in failure', function(assert) {
  const service = this.subject(),
    rejectFn = sinon.spy();

  this.notifications.setProperties({ error: sinon.spy() });

  service._logInFail(rejectFn);

  assert.ok(this.notifications.error.calledWith(AuthService.LOG_IN_FAIL_MSG));
  assert.ok(rejectFn.calledOnce);
});

test('logging in overall', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    ajax = sinon.stub(Ember.$, 'ajax'),
    storeAuthResponseSuccess = sinon.stub(service, 'storeAuthResponseSuccess'),
    _logInFail = sinon.stub(service, '_logInFail'),
    username = Math.random(),
    password = Math.random();

  this.requestService.setProperties({ handleIfError: sinon.stub().returnsArg(0) });

  assert.notOk(this.storageService.get('persistBetweenSessions'));
  service
    .login()
    .catch(() => {
      assert.ok(this.requestService.handleIfError.notCalled);
      assert.ok(ajax.notCalled);
      assert.ok(storeAuthResponseSuccess.notCalled);
      assert.ok(_logInFail.notCalled);

      ajax.rejects();
      _logInFail.callsArg(0);
      return service.login(username, password);
    })
    .catch(() => {
      assert.ok(this.requestService.handleIfError.calledOnce);
      assert.ok(ajax.calledOnce);
      assert.equal(ajax.firstCall.args[0].type, Constants.REQUEST_METHOD.POST);
      assert.ok(ajax.firstCall.args[0].url.includes(config.host));
      assert.ok(ajax.firstCall.args[0].url.includes(LocaleUtils.getTimezone()));
      assert.equal(ajax.firstCall.args[0].contentType, Constants.MIME_TYPE.JSON);
      assert.ok(ajax.firstCall.args[0].data.includes(username));
      assert.ok(ajax.firstCall.args[0].data.includes(password));
      assert.ok(storeAuthResponseSuccess.notCalled);
      assert.ok(_logInFail.calledOnce);
      assert.notOk(this.storageService.get('persistBetweenSessions'));

      ajax.resolves();
      storeAuthResponseSuccess.callsArg(1);
      return service.login(username, password);
    })
    .then(() => {
      assert.ok(this.requestService.handleIfError.calledTwice);
      assert.ok(ajax.calledTwice);
      assert.ok(storeAuthResponseSuccess.calledOnce);
      assert.ok(_logInFail.calledOnce);
      assert.equal(this.storageService.get('persistBetweenSessions'), false);

      return service.login(username, password, true);
    })
    .then(() => {
      assert.ok(this.requestService.handleIfError.calledThrice);
      assert.ok(ajax.calledThrice);
      assert.ok(storeAuthResponseSuccess.calledTwice);
      assert.ok(_logInFail.calledOnce);
      assert.equal(this.storageService.get('persistBetweenSessions'), true);

      ajax.restore();
      storeAuthResponseSuccess.restore();
      _logInFail.restore();
      done();
    });
});

test('setting up initially from storage + cleanup', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    _handleStorageChange = sinon.stub(service, '_handleStorageChange'),
    _setUpFromStorage = sinon.stub(service, '_setUpFromStorage').resolves();

  this.storageService.setProperties({
    sync: sinon.stub().resolves(),
    on: sinon.stub().returnsThis(),
  });

  this.storageService.sync.rejects();
  service
    .trySetUpFromStorage() // still resolves promise even if rejects
    .then(() => {
      assert.ok(this.storageService.on.calledOnce);
      assert.ok(
        this.storageService.on.calledWith(
          config.events.storage.updated,
          service,
          _handleStorageChange
        )
      );
      assert.ok(this.storageService.sync.calledOnce);
      assert.ok(this.storageService.sync.calledWith());
      assert.ok(_setUpFromStorage.notCalled);
      assert.ok(this.storageService.off.notCalled);

      this.storageService.sync.resolves();
      return service.trySetUpFromStorage();
    })
    .then(() => {
      assert.ok(this.storageService.on.calledTwice);
      assert.ok(this.storageService.sync.calledTwice);
      assert.ok(_setUpFromStorage.calledOnce);
      assert.ok(this.storageService.off.notCalled);

      run(() => service.destroy());

      assert.ok(this.storageService.off.calledWith(config.events.storage.updated, service));

      _handleStorageChange.restore();
      _setUpFromStorage.restore();
      done();
    });
});
