import Ember from 'ember';
import AuthRouteMixin from 'textup-frontend/mixins/auth-route';
import { module, test } from 'qunit';

module('Unit | Mixin | auth route');

// Replace this with your real tests.
test('it works', function(assert) {
  let AuthRouteObject = Ember.Object.extend(AuthRouteMixin);
  let subject = AuthRouteObject.create();
  assert.ok(subject);
});
