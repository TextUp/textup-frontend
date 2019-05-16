import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('color-badge', 'Unit | Component | color badge', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(() => this.subject(), TestUtils.ERROR_PROP_MISSING);

  assert.throws(() => this.subject({ text: 88, color: 88 }), TestUtils.ERROR_PROP_WRONG_TYPE);
});
