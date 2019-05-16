import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('infinite-scroll', 'Unit | Component | infinite scroll', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(
    () =>
      this.subject({
        data: 'hi',
        numTotal: 'hi',
        direction: 'hi',
        loadMessage: [],
        refreshMessage: [],
        doRegister: 'hi',
        onRefresh: 'hi',
        onLoad: 'hi',
      }),
    TestUtils.ERROR_PROP_WRONG_TYPE
  );
});
