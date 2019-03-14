import Ember from 'ember';
import SerializerShareableMixin from 'textup-frontend/mixins/serializer/shareable';
import { module, test } from 'qunit';

module('Unit | Mixin | serializer/shareable');

// Replace this with your real tests.
test('it works', function(assert) {
  let SerializerShareableObject = Ember.Object.extend(SerializerShareableMixin);
  let subject = SerializerShareableObject.create();
  assert.ok(subject);
});
