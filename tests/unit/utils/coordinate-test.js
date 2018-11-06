import { distance } from 'textup-frontend/utils/coordinate';
import { module, test } from 'qunit';

module('Unit | Utility | coordinate');

test('calculating distance', function(assert) {
  assert.deepEqual(distance(), NaN);
  assert.deepEqual(distance('not coord', [1, 2, 3]), NaN);

  assert.equal(distance({ x: 0, y: 0 }, { x: 0, y: 3 }), 3);
  assert.equal(distance({ x: 0, y: 0 }, { x: 3, y: 4 }), 5);
});
