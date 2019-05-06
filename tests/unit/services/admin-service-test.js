import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import NotificationsService from 'ember-cli-notifications/services/notification-messages-service';
import sinon from 'sinon';
import { moduleFor, test } from 'ember-qunit';

const { typeOf } = Ember;
let server;

moduleFor('service:admin-service', 'Unit | Service | admin service', {
  needs: [
    'model:staff',
    'serializer:staff',
    'service:auth-service',
    'service:data-service',
    'service:loading-slider',
    'validator:belongs-to',
    'validator:format',
    'validator:inclusion',
    'validator:length',
    'validator:presence',
  ],
  beforeEach() {
    server = sinon.createFakeServer({ respondImmediately: true });
    // see https://github.com/stonecircle/ember-cli-notifications/issues/169
    this.register('service:notifications', NotificationsService);
    this.register('service:requestService', Ember.Service);
    this.inject.service('requestService');
  },
  afterEach() {
    server.restore();
  },
});

test('editing staff id', function(assert) {
  const service = this.subject(),
    newStaffId = Math.random();

  assert.throws(() => service.set('editingStaffId', newStaffId));

  service.setEditingStaff(newStaffId);
  assert.equal(service.get('editingStaffId'), newStaffId);

  service.clearEditingStaff();
  assert.notOk(service.get('editingStaffId'));
});

test('loading pending staff', function(assert) {
  const service = this.subject(),
    orgId = 88,
    offset = 888,
    totalNum = 1000,
    done = assert.async();

  this.requestService.setProperties({ handleIfError: sinon.stub().returnsArg(0) });

  server.respondWith(/\/staffs*/, function(xhr) {
    assert.ok(xhr.url.indexOf(`offset=${offset}`) > -1);
    assert.ok(xhr.url.indexOf(`organizationId=${orgId}`) > -1);
    assert.ok(xhr.url.indexOf(Constants.STAFF.STATUS.PENDING) > -1);

    xhr.respond(
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify({
        staffs: [{ id: 1 }, { id: 2 }],
        meta: { total: totalNum },
      })
    );
  });

  service.loadPendingStaff(orgId, offset).then(result => {
    assert.equal(typeOf(result.pending), 'array');
    assert.equal(result.pending.length, 2);

    assert.equal(typeOf(result.numPending), 'number');
    assert.equal(result.numPending, totalNum);

    done();
  });
});
