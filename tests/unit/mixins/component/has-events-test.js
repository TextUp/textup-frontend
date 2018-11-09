import Ember from 'ember';
import ComponentHasEventsMixin from 'textup-frontend/mixins/component/has-events';
import { module, test } from 'qunit';

module('Unit | Mixin | component/has events');

test('event namespacing', function(assert) {
  const ComponentHasEventsObject = Ember.Object.extend(ComponentHasEventsMixin),
    elementId = Math.random(),
    obj = ComponentHasEventsObject.create({ elementId });

  assert.equal(obj._event(), `.${elementId}`);
  assert.equal(obj._event('hi'), `hi.${elementId}`);
  assert.equal(obj._event(88), `88.${elementId}`);
});
