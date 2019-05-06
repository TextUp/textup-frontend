import destroyApp from 'textup-frontend/tests/helpers/destroy-app';
import Ember from 'ember';
import sinon from 'sinon';
import { initialize } from 'textup-frontend/instance-initializers/ajax-prefilter-renew-token';
import { module, test } from 'qunit';

module('Unit | Instance Initializer | ajax prefilter renew token', {
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
  const startWatchingAjaxRequests = sinon.spy(),
    lookup = sinon.stub(this.appInstance, 'lookup').returns({ startWatchingAjaxRequests });

  initialize(this.appInstance);

  assert.ok(lookup.calledWith('service:renewTokenService'));
  assert.ok(startWatchingAjaxRequests.calledOnce);

  lookup.restore();
});
