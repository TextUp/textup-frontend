import Ember from 'ember';
import ComponentHasEventsMixin from 'textup-frontend/mixins/component/has-events';
import { module, test } from 'qunit';

const ComponentHasEventsObject = Ember.Object.extend(ComponentHasEventsMixin);

module('Unit | Mixin | component/has events');

test('event namespacing with default namespace', function(assert) {
  const elementId = Math.random(),
    obj = ComponentHasEventsObject.create({ elementId });

  assert.equal(obj._event(), `.${elementId}`);
  assert.equal(obj._event('hi'), `hi.${elementId}`);
  assert.equal(obj._event(88), `88.${elementId}`);
});

test('event namespacing with custom namespace', function(assert) {
  const customNameSpace = 'i-am-the-custom-namespace',
    obj = ComponentHasEventsObject.create();

  assert.equal(obj._event('', customNameSpace), `.${customNameSpace}`);
  assert.equal(obj._event('hi', customNameSpace), `hi.${customNameSpace}`);
  assert.equal(obj._event(88, customNameSpace), `88.${customNameSpace}`);
});
