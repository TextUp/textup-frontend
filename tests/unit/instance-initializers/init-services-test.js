import destroyApp from 'textup-frontend/tests/helpers/destroy-app';
import Ember from 'ember';
import sinon from 'sinon';
import { initialize } from 'textup-frontend/instance-initializers/init-services';
import { module, test } from 'qunit';

module('Unit | Instance Initializer | init services', {
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

test('it works', function(assert) {
  const pageVisibilityService = { startWatchingVisibilityChanges: sinon.spy() },
    renewTokenService = { startWatchingAjaxRequests: sinon.spy() },
    socketDataService = { startWatchingAuthChanges: sinon.spy() },
    storageService = { startWatchingStorageUpdates: sinon.spy() },
    tutorialService = { setUpTutorial: sinon.spy() },
    lookup = sinon.stub(this.appInstance, 'lookup');

  lookup.withArgs('service:pageVisibilityService').returns(pageVisibilityService);
  lookup.withArgs('service:renewTokenService').returns(renewTokenService);
  lookup.withArgs('service:socketDataService').returns(socketDataService);
  lookup.withArgs('service:storageService').returns(storageService);
  lookup.withArgs('service:tutorialService').returns(tutorialService);

  initialize(this.appInstance);

  assert.ok(pageVisibilityService.startWatchingVisibilityChanges.calledOnce);
  assert.ok(renewTokenService.startWatchingAjaxRequests.calledOnce);
  assert.ok(socketDataService.startWatchingAuthChanges.calledOnce);
  assert.ok(storageService.startWatchingStorageUpdates.calledOnce);
  assert.ok(tutorialService.setUpTutorial.calledOnce);

  lookup.restore();
});
