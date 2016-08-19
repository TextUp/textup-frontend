import Ember from 'ember';
import VisibilityInitializer from 'textup-frontend/initializers/visibility';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | visibility', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  VisibilityInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
