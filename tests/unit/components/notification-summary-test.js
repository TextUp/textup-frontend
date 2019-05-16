import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('notification-summary', 'Unit | Component | notification summary', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(
    () => this.subject({ notification: 'invalid', onOpen: 'invalid' }),
    TestUtils.ERROR_PROP_WRONG_TYPE
  );
});
