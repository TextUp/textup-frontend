import destroyApp from 'textup-frontend/tests/helpers/destroy-app';
import Ember from 'ember';
import sinon from 'sinon';
import { initialize } from 'textup-frontend/instance-initializers/setup-tutorial-state';
import { module, test } from 'qunit';

module('Unit | Instance Initializer | setup tutorial state', {
  beforeEach: function() {
    Ember.run(() => {
      this.application = Ember.Application.create();
      this.appInstance = this.application.buildInstance();
    });
  },
  afterEach: function() {
    Ember.run(this.appInstance, 'destroy');
    destroyApp(this.application);
  },
});

test('it works', function(assert) {
  const setUpTutorial = sinon.spy(),
    lookup = sinon.stub(this.appInstance, 'lookup').returns({ setUpTutorial });

  initialize(this.appInstance);

  assert.ok(lookup.calledWith('service:tutorialService'));
  assert.ok(setUpTutorial.calledOnce);

  lookup.restore();
});
