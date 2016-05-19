import Ember from 'ember';
import ValidatedInitializer from 'textup-frontend/initializers/validated';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | validated', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  ValidatedInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
