import EmberObject from '@ember/object';
import SerializerHasAuthorMixin from 'textup-frontend/mixins/serializer/has-author';
import { module, test } from 'qunit';

module('Unit | Mixin | serializer/has author');

test('no author properties should be serialized', function(assert) {
  const SerializerHasAuthorObject = EmberObject.extend(SerializerHasAuthorMixin);
  const obj = SerializerHasAuthorObject.create();

  assert.equal(obj.attrs.authorName.serialize, false);
  assert.equal(obj.attrs.authorId.serialize, false);
  assert.equal(obj.attrs.authorType.serialize, false);
});
