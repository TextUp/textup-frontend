import Ember from 'ember';
import FutureMessageModelMixin from 'textup-frontend/mixins/future-message-model';
import { module, test } from 'qunit';

module('Unit | Mixin | future message model');

// Replace this with your real tests.
test('it works', function(assert) {
  let FutureMessageModelObject = Ember.Object.extend(FutureMessageModelMixin);
  let subject = FutureMessageModelObject.create();
  assert.ok(subject);
});
