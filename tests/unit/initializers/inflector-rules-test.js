import Inflector from 'ember-inflector';
import InflectorRulesInitializer from 'textup-frontend/initializers/inflector-rules';
import { module, test } from 'qunit';

module('Unit | Initializer | inflector rules');

test('it works', function(assert) {
  InflectorRulesInitializer.initialize();

  assert.equal(Inflector.inflector.pluralize('staff'), 'staff');
  assert.equal(Inflector.inflector.pluralize('media'), 'media');
});
