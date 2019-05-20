import $ from 'jquery';
import Service from '@ember/service';
import { typeOf } from '@ember/utils';
import RSVP from 'rsvp';
import Constants from 'textup-frontend/constants';
import ErrorUtils from 'textup-frontend/utils/error';
import sinon from 'sinon';
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:request-service', 'Unit | Service | request service', {
  needs: ['service:analytics'],
  beforeEach() {
    this.register('service:authService', Service);
    this.inject.service('authService');
    this.register('service:notification-messages-service', Service);
    this.inject.service('notification-messages-service', { as: 'notifications' });
    this.register('service:router', Service);
    this.inject.service('router');
  },
});

test('making an authenticated request', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    authHeader = Math.random(),
    ajax = sinon.stub($, 'ajax').resolves(),
    setRequestHeader = sinon.spy(),
    key = Math.random(),
    val = Math.random();

  this.authService.setProperties({ authHeader });

  service.authRequest({ [key]: val }).then(() => {
    assert.ok(ajax.calledOnce);
    assert.equal(ajax.firstCall.args[0].contentType, Constants.MIME_TYPE.JSON);
    assert.equal(ajax.firstCall.args[0][key], val);
    assert.equal(typeOf(ajax.firstCall.args[0].beforeSend), 'function');

    ajax.firstCall.args[0].beforeSend({ setRequestHeader });
    assert.ok(setRequestHeader.calledWith(Constants.REQUEST_HEADER.AUTH, authHeader));

    ajax.restore();
    done();
  });
});

test('handling error', function(assert) {
  const service = this.subject(),
    msg1 = Math.random(),
    msg2 = Math.random();

  this.authService.setProperties({ logout: sinon.spy() });
  this.notifications.setProperties({ info: sinon.spy(), error: sinon.spy() });
  this.router.setProperties({ transitionTo: sinon.spy() });

  service.handleResponseErrorObj(null);
  assert.ok(this.authService.logout.notCalled);
  assert.ok(this.notifications.info.notCalled);
  assert.ok(this.notifications.error.notCalled);

  service.handleResponseErrorObj({
    [ErrorUtils.ERRORS_PROP_NAME]: [
      { [ErrorUtils.STATUS_PROP_NAME]: Constants.RESPONSE_STATUS.UNAUTHORIZED },
    ],
  });
  assert.equal(this.authService.logout.callCount, 1);
  assert.equal(this.notifications.info.callCount, 1);
  assert.ok(this.notifications.error.notCalled);

  service.handleResponseErrorObj({
    [ErrorUtils.ERRORS_PROP_NAME]: [
      { [ErrorUtils.STATUS_PROP_NAME]: Constants.RESPONSE_STATUS.TIMED_OUT },
    ],
  });
  assert.equal(this.authService.logout.callCount, 1);
  assert.equal(this.notifications.info.callCount, 1);
  assert.equal(this.notifications.error.callCount, 1);

  service.handleResponseErrorObj({
    [ErrorUtils.ERRORS_PROP_NAME]: [
      { [ErrorUtils.STATUS_PROP_NAME]: 888, [ErrorUtils.MESSAGE_PROP_NAME]: msg1 },
      { [ErrorUtils.STATUS_PROP_NAME]: 888, [ErrorUtils.MESSAGE_PROP_NAME]: msg2 },
    ],
  });

  assert.equal(this.authService.logout.callCount, 1);
  assert.equal(this.notifications.info.callCount, 1);
  assert.equal(this.notifications.error.callCount, 3);
  assert.ok(this.notifications.error.calledWith(msg1));
  assert.ok(this.notifications.error.calledWith(msg2));

  assert.ok(
    this.router.transitionTo.notCalled,
    'error handler should never transition as it did in the past because this is too invasive'
  );
});

test('handling wrapping request for error handling', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    val1 = Math.random(),
    val2 = Math.random();

  service.setProperties({ handleResponseErrorObj: sinon.spy() });

  service
    .handleIfError(val1)
    .then(retVal => {
      assert.equal(retVal, val1);
      assert.ok(service.handleResponseErrorObj.notCalled);

      return service.handleIfError(new RSVP.Promise((resolve, reject) => reject(val2)));
    })
    .catch(retVal => {
      assert.equal(retVal, val2);
      assert.equal(service.handleResponseErrorObj.callCount, 1);
      assert.ok(service.handleResponseErrorObj.calledWith(val2));

      done();
    });
});
