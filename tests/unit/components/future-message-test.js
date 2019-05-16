import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('future-message', 'Unit | Component | future message', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(() => this.subject(), TestUtils.ERROR_PROP_MISSING);

  assert.throws(
    () => this.subject({ message: 'not a future message' }),
    TestUtils.ERROR_PROP_WRONG_TYPE
  );
});
