import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('upcoming-future-messages', 'Unit | Component | upcoming future messages', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(
    () => this.subject({ nextFutureFire: 'not a date' }),
    TestUtils.ERROR_PROP_WRONG_TYPE,
    'if specified, must be date'
  );

  assert.throws(
    () => this.subject({ onClick: 'not a function' }),
    TestUtils.ERROR_PROP_WRONG_TYPE,
    'if specified, must be function'
  );
});
