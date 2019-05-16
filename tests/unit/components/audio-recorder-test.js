import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('audio-recorder', 'Unit | Component | audio recorder', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(() => {
    this.subject({
      onError: true,
      onFinish: true,
      disabled: () => null,
      message: true,
      unsupportedMessage: true,
      startMessage: true,
      recordingMessage: true,
      processingMessage: true,
    });
  }, TestUtils.ERROR_PROP_WRONG_TYPE);
});
