import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('tab-container', 'Unit | Component | tab container', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(
    () =>
      this.subject({ doRegister: 'not a function', onChange: 'not bool', startIndex: () => null }),
    TestUtils.ERROR_PROP_WRONG_TYPE
  );
});
