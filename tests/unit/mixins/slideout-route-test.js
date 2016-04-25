import Ember from 'ember';
import SlideoutRouteMixin from 'textup-frontend/mixins/slideout-route';
import { module, test } from 'qunit';

module('Unit | Mixin | slideout route');

// Replace this with your real tests.
test('it works', function(assert) {
  let SlideoutRouteObject = Ember.Object.extend(SlideoutRouteMixin);
  let subject = SlideoutRouteObject.create();
  assert.ok(subject);
});
