import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('record-item/metadata', 'Unit | Component | record item/metadata', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(
    () => this.subject({ timestamp: 'not a date', author: 88 }),
    TestUtils.ERROR_PROP_WRONG_TYPE
  );
});
