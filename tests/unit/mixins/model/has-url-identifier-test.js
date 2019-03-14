import Ember from 'ember';
import ModelHasUrlIdentifierMixin from 'textup-frontend/mixins/model/has-url-identifier';
import { module, test } from 'qunit';

module('Unit | Mixin | model/has url identifier');

// Replace this with your real tests.
test('it works', function(assert) {
  let ModelHasUrlIdentifierObject = Ember.Object.extend(ModelHasUrlIdentifierMixin);
  let subject = ModelHasUrlIdentifierObject.create();
  assert.ok(subject);
});
