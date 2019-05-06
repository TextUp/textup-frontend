import Ember from 'ember';
import sinon from 'sinon';
import StorageUtils from 'textup-frontend/utils/storage';
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:user-setup-service', 'Unit | Service | user setup service', {
  beforeEach() {
    this.register('service:authService', Ember.Service);
    this.inject.service('authService');
    this.register('service:dataService', Ember.Service);
    this.inject.service('dataService');
    this.register('service:numberService', Ember.Service);
    this.inject.service('numberService');
    this.register('service:storageService', Ember.Service);
    this.inject.service('storageService');
  },
});

test('skipping setup', function(assert) {
  const service = this.subject(),
    authUser = Math.random(),
    key = Math.random(),
    skipSetupKey = sinon.stub(StorageUtils, 'skipSetupKey').returns(key);

  this.authService.setProperties({ authUser });
  this.storageService.setProperties({ setItem: sinon.spy(), getItem: sinon.stub() });

  service.skipSetup();
  assert.ok(skipSetupKey.calledOnce);
  assert.ok(skipSetupKey.firstCall.calledWith(authUser));
  assert.ok(this.storageService.setItem.calledWith(key, StorageUtils.TRUE));

  this.storageService.getItem.returns(StorageUtils.TRUE);
  assert.equal(service.hasSkippedSetup(), true);
  assert.ok(skipSetupKey.calledTwice);
  assert.ok(skipSetupKey.secondCall.calledWith(authUser));
  assert.ok(this.storageService.getItem.calledWith(key));

  skipSetupKey.restore();
});

test('restoring previous setup progress from storage', function(assert) {
  const service = this.subject(),
    authUser = Math.random(),
    restoredNum = Math.random(),
    key = Math.random(),
    setupInProgressPhoneNumberKey = sinon
      .stub(StorageUtils, 'setupInProgressPhoneNumberKey')
      .returns(key);

  this.authService.setProperties({ authUser });
  this.storageService.setProperties({ getItem: sinon.stub() });

  assert.notOk(service.get('inProgressPersonalNumber'));
  assert.notOk(service.get('verificationCode'));

  this.storageService.getItem.returns(restoredNum);
  service.tryRestorePreviousState();
  assert.ok(setupInProgressPhoneNumberKey.calledWith(authUser));
  assert.ok(this.storageService.getItem.calledWith(key));
  assert.equal(service.get('inProgressPersonalNumber'), restoredNum);
  assert.notOk(service.get('verificationCode'));

  setupInProgressPhoneNumberKey.restore();
});

test('starting to verify personal number', function(assert) {
  const service = this.subject(),
    personalNumber = Math.random(),
    authUser = Math.random(),
    key = Math.random(),
    retVal = Math.random(),
    setupInProgressPhoneNumberKey = sinon
      .stub(StorageUtils, 'setupInProgressPhoneNumberKey')
      .returns(key);

  this.authService.setProperties({ authUser });
  this.storageService.setProperties({ setItem: sinon.spy() });
  this.numberService.setProperties({ startVerify: sinon.stub() });

  service.set('inProgressPersonalNumber', personalNumber);
  this.numberService.startVerify.returns(retVal);
  assert.equal(service.startPersonalNumberSetup(), retVal);

  assert.ok(setupInProgressPhoneNumberKey.calledWith(authUser));
  assert.ok(this.storageService.setItem.calledWith(key, personalNumber));
  assert.ok(this.numberService.startVerify.calledWith(personalNumber));

  setupInProgressPhoneNumberKey.restore();
});

test('finishing verify personal number', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    personalNumber = Math.random(),
    verificationCode = Math.random(),
    authUser = Ember.Object.create(),
    key = Math.random(),
    setupInProgressPhoneNumberKey = sinon
      .stub(StorageUtils, 'setupInProgressPhoneNumberKey')
      .returns(key);

  this.authService.setProperties({ authUser });
  this.storageService.setProperties({ removeItem: sinon.spy() });
  this.numberService.setProperties({ finishVerify: sinon.stub().resolves() });
  this.dataService.setProperties({ persist: sinon.stub().resolves() });

  service.setProperties({ inProgressPersonalNumber: personalNumber, verificationCode });
  service.finishPersonalNumberSetup().then(retVal => {
    assert.equal(retVal, authUser);

    assert.ok(this.numberService.finishVerify.calledWith(personalNumber, verificationCode));
    assert.ok(this.storageService.removeItem.calledWith(key));
    assert.notOk(service.get('inProgressPersonalNumber'));
    assert.notOk(service.get('verificationCode'));
    assert.equal(authUser.get('personalNumber'), personalNumber);
    assert.ok(this.dataService.persist.calledWith(authUser));

    setupInProgressPhoneNumberKey.restore();
    done();
  });
});
