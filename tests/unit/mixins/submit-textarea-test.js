import Ember from 'ember';
import SubmitTextareaMixin from 'textup-frontend/mixins/submit-textarea';
import { module, test } from 'qunit';

module('Unit | Mixin | submit textarea');

// Replace this with your real tests.
test('it works', function(assert) {
  let SubmitTextareaObject = Ember.Object.extend(SubmitTextareaMixin);
  let subject = SubmitTextareaObject.create();
  assert.ok(subject);
});
