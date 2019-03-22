import DS from 'ember-data';
import NotificationSerializer from 'textup-frontend/serializers/notification';
import { module, test } from 'qunit';

module('Unit | Serializer | notification');

test('it serializes records', function(assert) {
  const serializer = NotificationSerializer.create();

  assert.ok(serializer.attrs.details.deserialize, 'records');
  assert.ok(DS.EmbeddedRecordsMixin.detect(serializer));
});
