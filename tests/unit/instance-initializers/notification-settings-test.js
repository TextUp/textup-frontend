import destroyApp from 'textup-frontend/tests/helpers/destroy-app';
import Ember from 'ember';
import sinon from 'sinon';
import { initialize } from 'textup-frontend/instance-initializers/notification-settings';
import { module, test } from 'qunit';

module('Unit | Instance Initializer | notification settings', {
  beforeEach: function() {
    Ember.run(() => {
      this.application = Ember.Application.create();
      this.appInstance = this.application.buildInstance();
    });
  },
  afterEach: function() {
    Ember.run(this.appInstance, 'destroy');
    destroyApp(this.application);
  },
});

test('proper defaults are set on notification service', function(assert) {
  const serviceObj = { setDefaultClearNotification: sinon.spy(), setDefaultAutoClear: sinon.spy() },
    lookup = sinon.stub(this.appInstance, 'lookup').returns(serviceObj);

  initialize(this.appInstance);

  assert.ok(lookup.calledWith('service:notifications'));
  assert.ok(serviceObj.setDefaultClearNotification.calledWith(5000));
  assert.ok(serviceObj.setDefaultAutoClear.calledWith(true));

  lookup.restore();
});
