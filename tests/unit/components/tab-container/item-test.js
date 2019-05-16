import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('tab-container/item', 'Unit | Component | tab container/item', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(() => this.subject(), TestUtils.ERROR_PROP_MISSING);

  assert.throws(
    () => this.subject({ doRegister: 'not a function', onDestroy: 'not bool', title: () => null }),
    TestUtils.ERROR_PROP_WRONG_TYPE
  );
});
