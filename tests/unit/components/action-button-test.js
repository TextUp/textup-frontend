import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('action-button', 'Unit | Component | action button', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(() => this.subject(), TestUtils.ERROR_PROP_MISSING);

  assert.throws(
    () => this.subject({ onAction: 'not a function', disabled: 'not bool', error: 'not bool' }),
    TestUtils.ERROR_PROP_WRONG_TYPE
  );
});
