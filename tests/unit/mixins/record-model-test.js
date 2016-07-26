import Ember from 'ember';
import RecordModelMixin from 'textup-frontend/mixins/record-model';
import { module, test } from 'qunit';

module('Unit | Mixin | record model');

// Replace this with your real tests.
test('it works', function(assert) {
  let RecordModelObject = Ember.Object.extend(RecordModelMixin);
  let subject = RecordModelObject.create();
  assert.ok(subject);
});
