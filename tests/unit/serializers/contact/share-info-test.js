import { module, test } from 'qunit';
import ContactShareInfoSerializer from 'textup-frontend/serializers/contact/share-info';
import Shareable from 'textup-frontend/mixins/serializer/shareable';

module('Unit | Serializer | contact/share info');

test('is shareable', function(assert) {
  assert.ok(Shareable.detect(ContactShareInfoSerializer.create()));
});
