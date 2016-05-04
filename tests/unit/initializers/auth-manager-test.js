import Ember from 'ember';
import AuthManagerInitializer from 'textup-frontend/initializers/auth-manager';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | auth manager', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  AuthManagerInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
