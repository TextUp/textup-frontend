import Ember from 'ember';
import NoBounceInitializer from 'textup-frontend/initializers/no-bounce';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | no bounce', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  NoBounceInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
