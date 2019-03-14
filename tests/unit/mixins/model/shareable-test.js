import Ember from 'ember';
import ModelShareableMixin from 'textup-frontend/mixins/model/shareable';
import { module, test } from 'qunit';

module('Unit | Mixin | model/shareable');

// Replace this with your real tests.
test('it works', function(assert) {
  let ModelShareableObject = Ember.Object.extend(ModelShareableMixin);
  let subject = ModelShareableObject.create();
  assert.ok(subject);
});
