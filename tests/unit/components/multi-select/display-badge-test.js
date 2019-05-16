import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('multi-select/display-badge', 'Unit | Component | multi select/display badge', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(() => this.subject({ entity: 'not Ember obj' }), TestUtils.ERROR_PROP_WRONG_TYPE);
});
