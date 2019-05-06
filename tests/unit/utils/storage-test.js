import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import StorageUtils from 'textup-frontend/utils/storage';
import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { module, test } from 'qunit';

const { typeOf } = Ember;

module('Unit | Utility | storage');

test('throw missing input error', function(assert) {
  assert.throws(
    () => StorageUtils.throwMissingInputError(),
    new Error(StorageUtils.NO_AUTH_USER_ERROR_MSG)
  );
});

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
  assert.throws(
    () => StorageUtils.showManagerKey(),
    new Error(StorageUtils.NO_AUTH_USER_ERROR_MSG)
  );
});

test('task key', function(assert) {
  const authId = Math.random(),
    authUser = TestUtils.mockModel(authId, Constants.MODEL.STAFF),
    taskId = Math.random();

  assert.ok(StorageUtils.taskKey(authUser, taskId).includes(authId));
  assert.ok(StorageUtils.taskKey(authUser, taskId).includes(taskId));
  assert.throws(() => StorageUtils.taskKey(), new Error(StorageUtils.NO_AUTH_USER_ERROR_MSG));
});

test('tour key', function(assert) {
  const authId = Math.random(),
    authUser = TestUtils.mockModel(authId, Constants.MODEL.STAFF);

  assert.ok(StorageUtils.tourKey(authUser).includes(authId));
  assert.throws(() => StorageUtils.tourKey(), new Error(StorageUtils.NO_AUTH_USER_ERROR_MSG));
});

test('skip setup key', function(assert) {
  const authId = Math.random(),
    authUser = TestUtils.mockModel(authId, Constants.MODEL.STAFF);

  assert.ok(StorageUtils.skipSetupKey(authUser).includes(authId));
  assert.throws(() => StorageUtils.skipSetupKey(), new Error(StorageUtils.NO_AUTH_USER_ERROR_MSG));
});

test('skip setup in-progress phone number key', function(assert) {
  const authId = Math.random(),
    authUser = TestUtils.mockModel(authId, Constants.MODEL.STAFF);

  assert.ok(StorageUtils.setupInProgressPhoneNumberKey(authUser).includes(authId));
  assert.throws(
    () => StorageUtils.setupInProgressPhoneNumberKey(),
    new Error(StorageUtils.NO_AUTH_USER_ERROR_MSG)
  );
});
