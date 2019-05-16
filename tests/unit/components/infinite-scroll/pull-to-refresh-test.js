import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent(
  'infinite-scroll/pull-to-refresh',
  'Unit | Component | infinite scroll/pull to refresh',
  {
    unit: true,
  }
);

test('invalid inputs', function(assert) {
  assert.throws(
    () =>
      this.subject({
        direction: 'hi',
        disabled: 'hi',
        doRegister: 'hi',
        onRefresh: 'hi',
        refreshMessage: () => null,
      }),
    TestUtils.ERROR_PROP_WRONG_TYPE
  );
});
