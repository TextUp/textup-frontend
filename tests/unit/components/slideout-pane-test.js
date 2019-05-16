import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('slideout-pane', 'Unit | Component | slideout pane', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(() => this.subject(), TestUtils.ERROR_PROP_MISSING);

  assert.throws(
    () => this.subject({ onClose: () => null, direction: 'invalid', error: 'not bool' }),
    TestUtils.ERROR_PROP_WRONG_TYPE,
    'direction must be one the allowed values'
  );
});
