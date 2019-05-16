import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('audio-list', 'Unit | Component | audio list', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(() => {
    this.subject({
      audio: 'not an array',
      maxNumToDisplay: 'hi',
      sortPropName: 88,
      sortLowToHigh: 88,
    });
  }, TestUtils.ERROR_PROP_WRONG_TYPE);
});
