import Ember from 'ember';
import ModelHasReadableIdentifierMixin from 'textup-frontend/mixins/model/has-readable-identifier';
import { module, test } from 'qunit';

module('Unit | Mixin | model/has readable identifier');

// Replace this with your real tests.
test('it works', function(assert) {
  let ModelHasReadableIdentifierObject = Ember.Object.extend(ModelHasReadableIdentifierMixin);
  let subject = ModelHasReadableIdentifierObject.create();
  assert.ok(subject);
});
