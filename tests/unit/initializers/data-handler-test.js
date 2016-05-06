import Ember from 'ember';
import DataHandlerInitializer from 'textup-frontend/initializers/data-handler';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | data handler', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  DataHandlerInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
