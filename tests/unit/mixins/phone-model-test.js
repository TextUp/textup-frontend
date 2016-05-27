import Ember from 'ember';
import PhoneModelMixin from 'textup-frontend/mixins/phone-model';
import { module, test } from 'qunit';

module('Unit | Mixin | phone model');

// Replace this with your real tests.
test('it works', function(assert) {
  let PhoneModelObject = Ember.Object.extend(PhoneModelMixin);
  let subject = PhoneModelObject.create();
  assert.ok(subject);
});
