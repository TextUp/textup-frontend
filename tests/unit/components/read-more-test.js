import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('read-more', 'Unit | Component | read more', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(
    () => this.subject({ showText: true, hideText: true }),
    TestUtils.ERROR_PROP_WRONG_TYPE
  );
});
