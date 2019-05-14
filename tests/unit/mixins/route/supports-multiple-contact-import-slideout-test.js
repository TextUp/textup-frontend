import Ember from 'ember';
import RouteSupportsMultipleContactImportSlideoutMixin from 'textup-frontend/mixins/route/supports-multiple-contact-import-slideout';
import { module, test } from 'qunit';

module('Unit | Mixin | route/supports multiple contact import slideout');

// Replace this with your real tests.
test('it works', function(assert) {
  let RouteSupportsMultipleContactImportSlideoutObject = Ember.Object.extend(RouteSupportsMultipleContactImportSlideoutMixin);
  let subject = RouteSupportsMultipleContactImportSlideoutObject.create();
  assert.ok(subject);
});
