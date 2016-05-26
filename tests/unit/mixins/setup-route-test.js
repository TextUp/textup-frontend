import Ember from 'ember';
import SetupRouteMixin from 'textup-frontend/mixins/setup-route';
import { module, test } from 'qunit';

module('Unit | Mixin | setup route');

// Replace this with your real tests.
test('it works', function(assert) {
  let SetupRouteObject = Ember.Object.extend(SetupRouteMixin);
  let subject = SetupRouteObject.create();
  assert.ok(subject);
});
