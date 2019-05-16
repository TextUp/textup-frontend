import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('record-item/system-note', 'Unit | Component | record item/system note', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(() => this.subject(), TestUtils.ERROR_PROP_MISSING, 'requires note');

  assert.throws(
    () => this.subject({ note: 'not a note' }),
    TestUtils.ERROR_PROP_WRONG_TYPE,
    'requires note'
  );
});
