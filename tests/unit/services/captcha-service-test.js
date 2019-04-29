import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import sinon from 'sinon';
import { moduleFor, test } from 'ember-qunit';

const { RSVP } = Ember;

moduleFor('service:captcha-service', 'Unit | Service | captcha service');

test('checking if captcha is valid', function(assert) {
  const xhr = sinon.useFakeXMLHttpRequest(),
    onCreate = sinon.spy();
  xhr.onCreate = onCreate;

  const service = this.subject(),
    captchaKey = Math.random() + '';

  assert.ok(service.isValid(captchaKey) instanceof RSVP.Promise);
  assert.ok(onCreate.calledOnce);
  assert.equal(onCreate.firstCall.args[0].method, Constants.REQUEST_METHOD.POST);
  assert.equal(onCreate.firstCall.args[0].url, config.captcha.endpoint);
  assert.ok(onCreate.firstCall.args[0].requestBody.indexOf(captchaKey) > -1);
  assert.ok(onCreate.firstCall.args[0].requestBody.indexOf(config.captcha.location) > -1);

  xhr.restore();
});
