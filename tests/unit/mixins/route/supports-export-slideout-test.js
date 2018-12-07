import Ember from 'ember';
import RouteSupportsExportSlideoutMixin from 'textup-frontend/mixins/route/supports-export-slideout';
import { module, test } from 'qunit';

module('Unit | Mixin | route/supports export slideout');

// Replace this with your real tests.
test('it works', function(assert) {
  let RouteSupportsExportSlideoutObject = Ember.Object.extend(RouteSupportsExportSlideoutMixin);
  let subject = RouteSupportsExportSlideoutObject.create();
  assert.ok(subject);
});
