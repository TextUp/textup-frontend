import Ember from 'ember';
import PhoneNumberSerializerMixin from 'textup-frontend/mixins/phone-number-serializer';
import { module, test } from 'qunit';

module('Unit | Mixin | phone number serializer');

// Replace this with your real tests.
test('it works', function(assert) {
  let PhoneNumberSerializerObject = Ember.Object.extend(PhoneNumberSerializerMixin);
  let subject = PhoneNumberSerializerObject.create();
  assert.ok(subject);
});
