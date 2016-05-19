import Ember from 'ember';
import ValidatedComponentMixin from 'textup-frontend/mixins/validated-component';
import { module, test } from 'qunit';

module('Unit | Mixin | validated component');

// Replace this with your real tests.
test('it works', function(assert) {
  let ValidatedComponentObject = Ember.Object.extend(ValidatedComponentMixin);
  let subject = ValidatedComponentObject.create();
  assert.ok(subject);
});
