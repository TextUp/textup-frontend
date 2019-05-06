import config from 'textup-frontend/config/environment';
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:app-message-service', 'Unit | Service | app message service');

test('managing if should show', function(assert) {
  const service = this.subject();

  assert.equal(service.get('shouldShow'), config.appMessage.oldestMessageInDays);

  service.closeMessage();

  assert.equal(service.get('shouldShow'), false);
});
