import Ember from 'ember';
import ShowPasswordInitializer from 'textup-frontend/initializers/show-password';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | show password', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  ShowPasswordInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
