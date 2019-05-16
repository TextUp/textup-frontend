import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent(
  'record-actions-control/compose-text',
  'Unit | Component | record actions control/compose text',
  {
    unit: true,
  }
);

test('invalid inputs', function(assert) {
  assert.throws(
    () =>
      this.subject({
        numMedia: 'hi',
        placeholder: 88,
        contents: 88,
        onClearContents: 'hi',
        onSend: 'hi',
      }),
    TestUtils.ERROR_PROP_WRONG_TYPE
  );
});
