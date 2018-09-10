import Ember from 'ember';
import RouteManagesContactAttributesMixin from 'textup-frontend/mixins/route/manages-contact-attributes';
import { module, test } from 'qunit';

module('Unit | Mixin | route/manages contact attributes');

// Replace this with your real tests.
test('it works', function(assert) {
  let RouteManagesContactAttributesObject = Ember.Object.extend(RouteManagesContactAttributesMixin);
  let subject = RouteManagesContactAttributesObject.create();
  assert.ok(subject);
});
