import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('record-item/text', 'Unit | Component | record item/text', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(() => this.subject(), TestUtils.ERROR_PROP_MISSING, 'requires text');

  assert.throws(
    () => this.subject({ text: 'not a record text' }),
    TestUtils.ERROR_PROP_WRONG_TYPE,
    'requires text'
  );
});
