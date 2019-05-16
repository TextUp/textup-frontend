import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('record-item/call', 'Unit | Component | record item/call', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(() => this.subject(), TestUtils.ERROR_PROP_MISSING, 'requires call');

  assert.throws(
    () => this.subject({ call: 'not a call' }),
    TestUtils.ERROR_PROP_WRONG_TYPE,
    'requires call'
  );
});
