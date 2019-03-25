import Constants from 'textup-frontend/constants';
import NotificationsService from 'ember-cli-notifications/services/notification-messages-service';
import sinon from 'sinon';
import { mockModel } from 'textup-frontend/tests/helpers/utilities';
import { moduleFor, test } from 'ember-qunit';

let server;

moduleFor('service:sharing-service', 'Unit | Service | sharing service', {
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
    // see https://github.com/stonecircle/ember-cli-notifications/issues/169
    this.register('service:notifications', NotificationsService);

    server = sinon.createFakeServer({ respondImmediately: true });
  },
  afterEach() {
    server.restore();
  },
});

test('loading staff that user can share with for staff', function(assert) {
  const service = this.subject(),
    ownerId = Math.random(),
    phoneOwner = mockModel(1, Constants.MODEL.STAFF, { id: ownerId }),
    done = assert.async();

  server.respondWith(/\/staffs*/, xhr => {
    assert.ok(xhr.url.indexOf(Constants.STAFF.STATUS.ADMIN) > -1);
    assert.ok(xhr.url.indexOf(Constants.STAFF.STATUS.STAFF) > -1);
    assert.notOk(xhr.url.indexOf(`teamId=${ownerId}`) > -1);
    assert.ok(xhr.url.indexOf(`shareStaffId=${ownerId}`) > -1);

    xhr.respond(
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify({ staffs: [{ id: 1 }, { id: 2 }] })
    );
  });

  service.loadStaffForSharing(phoneOwner).then(staffs => {
    assert.equal(staffs.length, 2);

    done();
  });
});

test('loading staff that user can share with for team', function(assert) {
  const service = this.subject(),
    ownerId = Math.random(),
    phoneOwner = mockModel(1, Constants.MODEL.TEAM, { id: ownerId }),
    done = assert.async();

  server.respondWith(/\/staffs*/, xhr => {
    assert.ok(xhr.url.indexOf(Constants.STAFF.STATUS.ADMIN) > -1);
    assert.ok(xhr.url.indexOf(Constants.STAFF.STATUS.STAFF) > -1);
    assert.ok(xhr.url.indexOf(`teamId=${ownerId}`) > -1);
    assert.notOk(xhr.url.indexOf(`shareStaffId=${ownerId}`) > -1);

    xhr.respond(
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify({ staffs: [{ id: 1 }] })
    );
  });

  service.loadStaffForSharing(phoneOwner).then(staffs => {
    assert.equal(staffs.length, 1);

    done();
  });
});
