import Ember from 'ember';
import * as MapService from 'textup-frontend/services/map-service';
import sinon from 'sinon';
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:map-service', 'Unit | Service | map service', {
  beforeEach() {
    this.register('service:notification-messages-service', Ember.Service);
    this.inject.service('notification-messages-service', { as: 'notifications' });
  },
});

test('displaying error', function(assert) {
  const service = this.subject();

  this.notifications.setProperties({ error: sinon.spy() });

  service.handleError();

  assert.ok(this.notifications.error.calledOnce);
  assert.ok(this.notifications.error.calledWith(MapService.MAP_ERROR_MSG));
});
