import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('audio-player', 'Unit | Component | audio player', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(() => {
    this.subject({ audio: false, disabled: 'a string', message: true });
  }, TestUtils.ERROR_PROP_WRONG_TYPE);
});
