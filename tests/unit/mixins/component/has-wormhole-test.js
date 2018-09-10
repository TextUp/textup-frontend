import Ember from 'ember';
import ComponentHasWormholeMixin from 'textup-frontend/mixins/component/has-wormhole';
import { module, test } from 'qunit';

module('Unit | Mixin | component/has wormhole');

// Replace this with your real tests.
test('it works', function(assert) {
  let ComponentHasWormholeObject = Ember.Object.extend(ComponentHasWormholeMixin);
  let subject = ComponentHasWormholeObject.create();
  assert.ok(subject);
});
