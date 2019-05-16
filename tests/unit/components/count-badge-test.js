import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('count-badge', 'Unit | Component | count badge', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(
    () => this.subject({ count: 'hi', hideBadgeIfNone: 'hi' }),
    TestUtils.ERROR_PROP_WRONG_TYPE
  );
});
