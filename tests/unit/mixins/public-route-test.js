import Ember from 'ember';
import PublicRouteMixin from 'textup-frontend/mixins/public-route';
import { module, test } from 'qunit';

module('Unit | Mixin | public route');

// Replace this with your real tests.
test('it works', function(assert) {
  let PublicRouteObject = Ember.Object.extend(PublicRouteMixin);
  let subject = PublicRouteObject.create();
  assert.ok(subject);
});
