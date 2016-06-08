import Ember from 'ember';
import NewPhoneSerializerMixin from 'textup-frontend/mixins/new-phone-serializer';
import { module, test } from 'qunit';

module('Unit | Mixin | new phone serializer');

// Replace this with your real tests.
test('it works', function(assert) {
  let NewPhoneSerializerObject = Ember.Object.extend(NewPhoneSerializerMixin);
  let subject = NewPhoneSerializerObject.create();
  assert.ok(subject);
});
