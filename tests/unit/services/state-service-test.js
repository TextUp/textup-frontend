import Service from '@ember/service';
import { run } from '@ember/runloop';
import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import sinon from 'sinon';
import StorageUtils from 'textup-frontend/utils/storage';
import TestUtils from 'textup-frontend/tests/helpers/utilities';
import wait from 'ember-test-helpers/wait';
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:state-service', 'Unit | Service | state service', {
  needs: ['service:analytics'],
  beforeEach() {
    this.register('service:router', Service);
    this.inject.service('router');
    this.register('service:storageService', Service);
    this.inject.service('storageService');
  },
});

test('determining where te user is in the application', function(assert) {
  const service = this.subject();

  this.router.set('currentRouteName', Math.random());
  assert.equal(service.get('viewingContacts'), false);
  assert.equal(service.get('viewingTag'), false);
  assert.equal(service.get('viewingSearch'), false);
  assert.equal(service.get('viewingMany'), false);
  assert.equal(service.get('viewingPeople'), false);
  assert.equal(service.get('viewingTeam'), false);
  assert.equal(service.get('currentRouteName'), this.router.get('currentRouteName'));

  this.router.set('currentRouteName', 'main.contacts');
  assert.equal(service.get('viewingContacts'), true);
  assert.equal(service.get('viewingTag'), false);
  assert.equal(service.get('viewingSearch'), false);
  assert.equal(service.get('viewingMany'), false);
  assert.equal(service.get('viewingPeople'), false);
  assert.equal(service.get('viewingTeam'), false);

  this.router.set('currentRouteName', 'main.tag');
  assert.equal(service.get('viewingContacts'), false);
  assert.equal(service.get('viewingTag'), true);
  assert.equal(service.get('viewingSearch'), false);
  assert.equal(service.get('viewingMany'), false);
  assert.equal(service.get('viewingPeople'), false);
  assert.equal(service.get('viewingTeam'), false);

  this.router.set('currentRouteName', 'main.search');
  assert.equal(service.get('viewingContacts'), false);
  assert.equal(service.get('viewingTag'), false);
  assert.equal(service.get('viewingSearch'), true);
  assert.equal(service.get('viewingMany'), false);
  assert.equal(service.get('viewingPeople'), false);
  assert.equal(service.get('viewingTeam'), false);

  this.router.set('currentRouteName', 'main.contacts.many');
  assert.equal(service.get('viewingContacts'), true);
  assert.equal(service.get('viewingTag'), false);
  assert.equal(service.get('viewingSearch'), false);
  assert.equal(service.get('viewingMany'), true);
  assert.equal(service.get('viewingPeople'), false);
  assert.equal(service.get('viewingTeam'), false);

  this.router.set('currentRouteName', 'admin.people');
  assert.equal(service.get('viewingContacts'), false);
  assert.equal(service.get('viewingTag'), false);
  assert.equal(service.get('viewingSearch'), false);
  assert.equal(service.get('viewingMany'), false);
  assert.equal(service.get('viewingPeople'), true);
  assert.equal(service.get('viewingTeam'), false);

  this.router.set('currentRouteName', 'admin.team');
  assert.equal(service.get('viewingContacts'), false);
  assert.equal(service.get('viewingTag'), false);
  assert.equal(service.get('viewingSearch'), false);
  assert.equal(service.get('viewingMany'), false);
  assert.equal(service.get('viewingPeople'), false);
  assert.equal(service.get('viewingTeam'), true);
});

test('owner properties', function(assert) {
  const service = this.subject(),
    staffObj = TestUtils.mockModel(1, Constants.MODEL.STAFF),
    teamObj = TestUtils.mockModel(1, Constants.MODEL.TEAM),
    orgObj = TestUtils.mockModel(1, Constants.MODEL.ORG);

  assert.equal(service.get('ownerIsTeam'), false);
  assert.notOk(service.get('ownerAsTeam'));
  assert.equal(service.get('ownerIsOrg'), false);
  assert.notOk(service.get('ownerAsOrg'));

  service.set('owner', teamObj);
  assert.equal(service.get('ownerIsTeam'), true);
  assert.equal(service.get('ownerAsTeam'), teamObj);
  assert.equal(service.get('ownerIsOrg'), false);
  assert.notOk(service.get('ownerAsOrg'));

  service.set('owner', orgObj);
  assert.equal(service.get('ownerIsTeam'), false);
  assert.notOk(service.get('ownerAsTeam'));
  assert.equal(service.get('ownerIsOrg'), true);
  assert.equal(service.get('ownerAsOrg'), orgObj);

  service.set('owner', staffObj);
  assert.equal(service.get('ownerIsTeam'), false);
  assert.notOk(service.get('ownerAsTeam'));
  assert.equal(service.get('ownerIsOrg'), false);
  assert.notOk(service.get('ownerAsOrg'));
});

test('trying to restore url', function(assert) {
  const service = this.subject(),
    doNotRestoreRoute = config.state.ignoreRestoreStoredUrlRouteNames[0],
    restoreRoute = Math.random() + '',
    urlToRestore = Math.random() + '';

  this.storageService.setProperties({ getItem: sinon.stub() });

  assert.notOk(service.startTrackingAndGetUrlToRestoreIfNeeded(null));
  assert.ok(this.storageService.getItem.calledWith(StorageUtils.currentUrlKey()));

  this.storageService.getItem.returns(null);
  assert.notOk(
    service.startTrackingAndGetUrlToRestoreIfNeeded(restoreRoute),
    'null because no url is stored'
  );

  this.storageService.getItem.returns(urlToRestore);
  assert.equal(service.startTrackingAndGetUrlToRestoreIfNeeded(restoreRoute), urlToRestore);

  this.storageService.getItem.returns(urlToRestore);
  assert.notOk(
    service.startTrackingAndGetUrlToRestoreIfNeeded(doNotRestoreRoute),
    'route is not that we ignore restoring for'
  );
});

test('observing and storing location changes + cleaning up', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    newUrl1 = Math.random(),
    newUrl2 = Math.random();

  this.storageService.setProperties({ getItem: sinon.spy(), setItem: sinon.spy() });

  service.startTrackingAndGetUrlToRestoreIfNeeded();
  assert.ok(this.storageService.setItem.notCalled);

  this.router.set('currentURL', newUrl1);
  wait()
    .then(() => {
      assert.ok(this.storageService.setItem.calledWith(StorageUtils.currentUrlKey(), newUrl1));

      run(() => service.destroy());
      this.router.set('currentURL', newUrl2);
      return wait();
    })
    .then(() => {
      assert.notOk(
        this.storageService.setItem.calledWith(StorageUtils.currentUrlKey(), newUrl2),
        'observer removed on destroy'
      );

      done();
    });
});
