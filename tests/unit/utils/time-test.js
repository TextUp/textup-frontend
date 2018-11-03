import { formatSecondsAsTimeElapsed } from 'textup-frontend/utils/time';
import { module, test } from 'qunit';

module('Unit | Utility | time');

test('formatting seconds as time elapsed timestamp', function(assert) {
  assert.equal(formatSecondsAsTimeElapsed(), '');
  assert.equal(formatSecondsAsTimeElapsed(null), '');
  assert.equal(formatSecondsAsTimeElapsed([]), '');
  assert.equal(formatSecondsAsTimeElapsed({}), '');
  assert.equal(formatSecondsAsTimeElapsed('blah'), '');

  assert.equal(formatSecondsAsTimeElapsed(-1), '00:00');
  assert.equal(formatSecondsAsTimeElapsed(0), '00:00');
  assert.equal(formatSecondsAsTimeElapsed(3), '00:03');
  assert.equal(formatSecondsAsTimeElapsed(88), '01:28');
  assert.equal(formatSecondsAsTimeElapsed(611), '10:11');
  assert.equal(formatSecondsAsTimeElapsed(3668), '01:01:08');
  assert.equal(formatSecondsAsTimeElapsed(172800), '48:00:00');
});
