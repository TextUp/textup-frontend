import Ember from 'ember';
import PhoneSerializerMixin from 'textup-frontend/mixins/phone-serializer';
import { module, test } from 'qunit';

module('Unit | Mixin | phone serializer');

// Replace this with your real tests.
test('it works', function(assert) {
  let PhoneSerializerObject = Ember.Object.extend(PhoneSerializerMixin);
  let subject = PhoneSerializerObject.create();
  assert.ok(subject);
});
