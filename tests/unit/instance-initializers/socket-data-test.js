import destroyApp from 'textup-frontend/tests/helpers/destroy-app';
import Ember from 'ember';
import sinon from 'sinon';
import { initialize } from 'textup-frontend/instance-initializers/socket-data';
import { module, test } from 'qunit';

module('Unit | Instance Initializer | socket data', {
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

test('socketDatService will start watching for auth changes', function(assert) {
  const serviceObj = { startWatchingAuthChanges: sinon.spy() },
    lookup = sinon.stub(this.appInstance, 'lookup').returns(serviceObj);

  initialize(this.appInstance);

  assert.ok(lookup.calledWith('service:socketDataService'));
  assert.ok(serviceObj.startWatchingAuthChanges.calledOnce);

  lookup.restore();
});