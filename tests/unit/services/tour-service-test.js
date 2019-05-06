import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import sinon from 'sinon';
import StorageUtils from 'textup-frontend/utils/storage';
import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:tour-service', 'Unit | Service | tour service', {
  beforeEach() {
    this.register('service:authService', Ember.Service);
    this.inject.service('authService');
    this.register('service:storageService', Ember.Service);
    this.inject.service('storageService');
  },
});

test('alias read-only properties', function(assert) {
  const service = this.subject();

  assert.notOk(service.get('isTourOngoing'));

  service.set('_tourManager', { isOngoing: true });

  assert.ok(service.get('isTourOngoing'), true);
  assert.throws(() => service.set('isTourOngoing'), 'is read-only');
});

test('deciding if should start tour', function(assert) {
  const service = this.subject(),
    authUser = TestUtils.mockModel(1, Constants.MODEL.STAFF);

  this.authService.setProperties({ authUser });
  this.storageService.setProperties({ getItem: sinon.stub() });

  this.storageService.getItem.returns(StorageUtils.TRUE);
  assert.equal(service._shouldStartTour(), false, 'has finished tour');
  assert.ok(this.storageService.getItem.firstCall.args[0].includes(authUser.get('id')));

  this.storageService.getItem.returns(StorageUtils.FALSE);
  assert.equal(service._shouldStartTour(), true, 'has NOT finished tour');
  assert.ok(this.storageService.getItem.secondCall.args[0].includes(authUser.get('id')));
});

test('registering tour manager and trying to start tour', function(assert) {
  const service = this.subject(),
    tourManagerObj = { actions: { startTour: sinon.spy() } },
    _shouldStartTour = sinon.stub(service, '_shouldStartTour');

  service.registerManagerAndTryStart(null);
  assert.notOk(service.get('_tourManager'));
  assert.ok(tourManagerObj.actions.startTour.notCalled);

  _shouldStartTour.returns(false);
  service.registerManagerAndTryStart(tourManagerObj);
  assert.equal(service.get('_tourManager'), tourManagerObj);
  assert.ok(tourManagerObj.actions.startTour.notCalled);

  _shouldStartTour.returns(true);
  service.registerManagerAndTryStart(tourManagerObj);
  assert.equal(service.get('_tourManager'), tourManagerObj);
  assert.ok(tourManagerObj.actions.startTour.calledOnce);

  _shouldStartTour.restore();
});

test('when tour is finished', function(assert) {
  const service = this.subject(),
    authUser = TestUtils.mockModel(1, Constants.MODEL.STAFF);
  this.authService.setProperties({ authUser });
  this.storageService.setProperties({ setItem: sinon.spy() });

  service.onTourFinish();

  assert.ok(this.storageService.setItem.calledOnce);
  assert.ok(this.storageService.setItem.firstCall.args[0].includes(authUser.get('id')));
  assert.equal(this.storageService.setItem.firstCall.args[1], StorageUtils.TRUE);
});
