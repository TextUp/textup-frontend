import Service from '@ember/service';
import Constants from 'textup-frontend/constants';
import sinon from 'sinon';
import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:sharing-service', 'Unit | Service | sharing service', {
  beforeEach() {
    this.register('service:requestService', Service);
    this.inject.service('requestService');
    this.register('service:store', Service);
    this.inject.service('store');
  },
});

test('loading share staff errors', function(assert) {
  const service = this.subject(),
    done = assert.async();

  this.requestService.setProperties({ handleIfError: sinon.stub() });

  service.loadStaffCandidatesForPhoneOwner(null).catch(() => {
    assert.ok(this.requestService.handleIfError.notCalled);

    done();
  });
});

test('loading staff that user can share with for staff', function(assert) {
  const service = this.subject(),
    staffObj = TestUtils.mockModel(88, Constants.MODEL.STAFF),
    shareCandidates = [Math.random()],
    resultObj = { toArray: sinon.stub().returns(shareCandidates) },
    done = assert.async();

  this.requestService.setProperties({ handleIfError: sinon.stub() });
  this.store.setProperties({ query: sinon.stub().resolves() });

  this.requestService.handleIfError.resolves(resultObj);
  service.loadStaffCandidatesForPhoneOwner(staffObj).then(() => {
    assert.ok(this.requestService.handleIfError.calledOnce);
    assert.ok(this.store.query.calledWith(Constants.MODEL.STAFF), 'querying for staff');
    assert.deepEqual(this.store.query.firstCall.args[1].status, [
      Constants.STAFF.STATUS.ADMIN,
      Constants.STAFF.STATUS.STAFF,
    ]);
    assert.equal(this.store.query.firstCall.args[1].teamId, null, 'not a team');
    assert.equal(this.store.query.firstCall.args[1].shareStaffId, staffObj.get('id'), 'is a staff');

    assert.deepEqual(service.get('staffCandidates'), shareCandidates);

    done();
  });
});

test('loading staff that user can share with for team', function(assert) {
  const service = this.subject(),
    teamObj = TestUtils.mockModel(88, Constants.MODEL.TEAM),
    shareCandidates = [Math.random()],
    resultObj = { toArray: sinon.stub().returns(shareCandidates) },
    done = assert.async();

  this.requestService.setProperties({ handleIfError: sinon.stub() });
  this.store.setProperties({ query: sinon.stub().resolves() });

  this.requestService.handleIfError.resolves(resultObj);
  service.loadStaffCandidatesForPhoneOwner(teamObj).then(() => {
    assert.ok(this.requestService.handleIfError.calledOnce);
    assert.ok(this.store.query.calledWith(Constants.MODEL.STAFF), 'querying for staff');
    assert.deepEqual(this.store.query.firstCall.args[1].status, [
      Constants.STAFF.STATUS.ADMIN,
      Constants.STAFF.STATUS.STAFF,
    ]);
    assert.equal(this.store.query.firstCall.args[1].teamId, teamObj.get('id'), 'is a team');
    assert.equal(this.store.query.firstCall.args[1].shareStaffId, null, 'not a staff');

    assert.deepEqual(service.get('staffCandidates'), shareCandidates);

    done();
  });
});
