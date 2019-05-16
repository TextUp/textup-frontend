import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('audio-control/display', 'Unit | Component | audio control/display', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(
    () =>
      this.subject({ message: 123, maxNumSeconds: 'hi', currentNumSeconds: 'hi', onSelect: 'hi' }),
    TestUtils.ERROR_PROP_WRONG_TYPE
  );
});
