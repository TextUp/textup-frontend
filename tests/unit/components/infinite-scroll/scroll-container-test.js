import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent(
  'infinite-scroll/scroll-container',
  'Unit | Component | infinite scroll/scroll container',
  {
    unit: true,
  }
);

test('invalid inputs', function(assert) {
  assert.throws(
    () =>
      this.subject({
        direction: () => null,
        doRegister: 'hi',
        onNearEnd: 'hi',
        disabled: 'hi',
        contentClass: true,
      }),
    TestUtils.ERROR_PROP_WRONG_TYPE
  );
});
