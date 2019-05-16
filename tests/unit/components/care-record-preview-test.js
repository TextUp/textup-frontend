import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('care-record-preview', 'Unit | Component | care record preview', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(
    () =>
      this.subject({
        name: () => null,
        noItemsMessage: () => null,
        recordClusters: () => null,
        onOpen: [],
      }),
    TestUtils.ERROR_PROP_WRONG_TYPE
  );
});
