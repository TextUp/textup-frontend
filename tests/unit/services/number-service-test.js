import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import sinon from 'sinon';
import { moduleFor, test } from 'ember-qunit';

let server;

moduleFor('service:number-service', 'Unit | Service | number service', {
  needs: [
    'service:authService',
    'service:dataService',
    'service:loadingSlider',
    'service:storageService',
    'service:requestService',
  ],
  beforeEach() {
    // see https://github.com/stonecircle/ember-cli-notifications/issues/169
    this.register(
      'service:notifications',
      Ember.Service.extend({ info: sinon.spy(), success: sinon.spy() })
    );
    this.inject.service('notifications');

    server = sinon.createFakeServer({ respondImmediately: true });
  },
  afterEach() {
    server.restore();
  },
});

test('starting verify number', function(assert) {
  const service = this.subject(),
    number = Math.random(),
    done = assert.async();

  server.respondWith('POST', config.host + '/v1/numbers', xhr => {
    assert.equal(JSON.parse(xhr.requestBody).phoneNumber, number);

    xhr.respond(204);
  });

  service.startVerify(number).then(() => {
    assert.ok(this.notifications.info.calledOnce);
    done();
  });
});

test('finish verify number', function(assert) {
  const service = this.subject(),
    number = Math.random(),
    code = Math.random(),
    done = assert.async();

  server.respondWith('POST', config.host + '/v1/numbers', xhr => {
    const body = JSON.parse(xhr.requestBody);
    assert.equal(body.phoneNumber, number);
    assert.equal(body.token, code);

    xhr.respond(204);
  });

  service.finishVerify(number, code).then(() => {
    assert.ok(this.notifications.success.calledOnce);
    done();
  });
});

test('listing available numbers', function(assert) {
  const service = this.subject(),
    search = Math.random() + '',
    number = Math.random(),
    sid = Math.random(),
    region = Math.random(),
    done = assert.async();

  server.respondWith(/\/v1\/numbers\?search=(.*)/, (xhr, query) => {
    assert.equal(query, search);

    xhr.respond(
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify({
        numbers: [{ number, sid, region }],
      })
    );
  });

  service.listAvailable(search).then(numbers => {
    assert.equal(numbers.length, 1);
    assert.equal(numbers[0][Constants.PROP_NAME.AVAILABLE_NUMBER], number);
    assert.equal(numbers[0][Constants.PROP_NAME.NEW_NUMBER_ID], sid);
    assert.equal(numbers[0].region, region);

    done();
  });
});
