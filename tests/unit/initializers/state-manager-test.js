import Ember from 'ember';
import StateManagerInitializer from 'textup-frontend/initializers/state-manager';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | state manager', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  StateManagerInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
