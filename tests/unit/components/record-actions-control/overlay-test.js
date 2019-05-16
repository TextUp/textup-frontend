import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent(
  'record-actions-control/overlay',
  'Unit | Component | record actions control/overlay',
  {
    unit: true,
  }
);

test('invalid inputs', function(assert) {
  assert.throws(
    () =>
      this.subject({
        show: 'not a bool',
        onClose: 'not a function',
        closeButtonLabel: true,
        showCloseButton: 'not a bool',
      }),
    TestUtils.ERROR_PROP_WRONG_TYPE
  );
});
