import { typeOf } from '@ember/utils';
import Constants from 'textup-frontend/constants';
import StorageUtils from 'textup-frontend/utils/storage';
import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { module, test } from 'qunit';

module('Unit | Utility | storage');

test('generating keys with no input', function(assert) {
  assert.equal(typeOf(StorageUtils.numAttemptsKey()), 'string');
  assert.equal(typeOf(StorageUtils.currentUrlKey()), 'string');
  assert.equal(typeOf(StorageUtils.authTokenKey()), 'string');
  assert.equal(typeOf(StorageUtils.authRefreshTokenKey()), 'string');
  assert.equal(typeOf(StorageUtils.authUserIdKey()), 'string');
});

test('task manager key', function(assert) {
  const authId = Math.random(),
    authUser = TestUtils.mockModel(authId, Constants.MODEL.STAFF);

  assert.ok(StorageUtils.showManagerKey(authUser).includes(authId));
  assert.notOk(StorageUtils.showManagerKey());
});

test('task key', function(assert) {
  const authId = Math.random(),
    authUser = TestUtils.mockModel(authId, Constants.MODEL.STAFF),
    taskId = Math.random();

  assert.ok(StorageUtils.taskKey(authUser, taskId).includes(authId));
  assert.ok(StorageUtils.taskKey(authUser, taskId).includes(taskId));
  assert.notOk(StorageUtils.taskKey());
});

test('tour key', function(assert) {
  const authId = Math.random(),
    authUser = TestUtils.mockModel(authId, Constants.MODEL.STAFF);

  assert.ok(StorageUtils.tourKey(authUser).includes(authId));
  assert.notOk(StorageUtils.tourKey());
});

test('skip setup key', function(assert) {
  const authId = Math.random(),
    authUser = TestUtils.mockModel(authId, Constants.MODEL.STAFF);

  assert.ok(StorageUtils.skipSetupKey(authUser).includes(authId));
  assert.notOk(StorageUtils.skipSetupKey());
});

test('skip setup in-progress phone number key', function(assert) {
  const authId = Math.random(),
    authUser = TestUtils.mockModel(authId, Constants.MODEL.STAFF);

  assert.ok(StorageUtils.setupInProgressPhoneNumberKey(authUser).includes(authId));
  assert.notOk(StorageUtils.setupInProgressPhoneNumberKey());
});
