import Ember from 'ember';
import DirtyModelsInitializer from 'textup-frontend/initializers/dirty-models';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | dirty models', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  DirtyModelsInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
