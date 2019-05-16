import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('photo-control/add', 'Unit | Component | photo control/add', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(() => this.subject(), TestUtils.ERROR_PROP_MISSING, 'must pass in onAdd handler');

  assert.throws(
    () => this.subject({ onAdd: 'not a function' }),
    TestUtils.ERROR_PROP_WRONG_TYPE,
    'must pass in a function'
  );
});
