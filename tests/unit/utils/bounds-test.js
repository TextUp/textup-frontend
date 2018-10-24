import { getWidthProportionFromLeft } from 'textup-frontend/utils/bounds';
import { module, test } from 'qunit';

module('Unit | Utility | bounds');

test('getting width proportion from left', function(assert) {
  assert.equal(getWidthProportionFromLeft(), 0.0, 'missing inputs');
  assert.equal(
    getWidthProportionFromLeft(2, 2, 2, 2, 2, 'not number'),
    0.0,
    'not all inputs are numbers'
  );
  assert.equal(
    getWidthProportionFromLeft(2, 2, -2, 2, 2, 2),
    0.0,
    'not all inputs are positive numbers'
  );

  const boxX = 10,
    boxY = 20,
    boxWidth = 20,
    boxHeight = 100;
  const inBoundsX = boxX + boxWidth * 0.8,
    inBoundsY = boxY + boxHeight * 0.3;
  const exceedBoundsX = boxX + boxWidth + 10,
    exceedBoundsY = boxY + boxHeight + 10;

  assert.equal(
    getWidthProportionFromLeft(0, inBoundsY, boxX, boxY, boxWidth, boxHeight),
    0.0,
    'out of bounds on left'
  );
  assert.equal(
    getWidthProportionFromLeft(inBoundsX, 0, boxX, boxY, boxWidth, boxHeight),
    0.0,
    'out of bounds on top'
  );
  assert.equal(
    getWidthProportionFromLeft(exceedBoundsX, inBoundsY, boxX, boxY, boxWidth, boxHeight),
    0.0,
    'out of bounds on right'
  );
  assert.equal(
    getWidthProportionFromLeft(inBoundsX, exceedBoundsY, boxX, boxY, boxWidth, boxHeight),
    0.0,
    'out of bounds on bottom'
  );

  assert.equal(
    getWidthProportionFromLeft(0, 0, boxX, boxY, boxWidth, boxHeight),
    0.0,
    'out of bounds on top left'
  );
  assert.equal(
    getWidthProportionFromLeft(0, exceedBoundsX, boxX, boxY, boxWidth, boxHeight),
    0.0,
    'out of bounds on top right'
  );
  assert.equal(
    getWidthProportionFromLeft(exceedBoundsY, 0, boxX, boxY, boxWidth, boxHeight),
    0.0,
    'out of bounds on bottom left'
  );
  assert.equal(
    getWidthProportionFromLeft(exceedBoundsY, exceedBoundsX, boxX, boxY, boxWidth, boxHeight),
    0.0,
    'out of bounds on bottom right'
  );

  assert.equal(
    getWidthProportionFromLeft(inBoundsX, inBoundsY, boxX, boxY, boxWidth, boxHeight),
    (inBoundsX - boxX) / boxWidth,
    'within bounds somewhere in center'
  );

  assert.equal(
    getWidthProportionFromLeft(boxX, inBoundsY, boxX, boxY, boxWidth, boxHeight),
    0.0,
    'very left edge of bounds'
  );
  assert.equal(
    getWidthProportionFromLeft(boxX + boxWidth, inBoundsY, boxX, boxY, boxWidth, boxHeight),
    1.0,
    'very right edge of bounds'
  );

  assert.equal(
    getWidthProportionFromLeft(boxX, boxY, boxX, boxY, boxWidth, boxHeight),
    0.0,
    'top left corner'
  );
  assert.equal(
    getWidthProportionFromLeft(boxX + boxWidth, boxY, boxX, boxY, boxWidth, boxHeight),
    1.0,
    'top right corner'
  );
  assert.equal(
    getWidthProportionFromLeft(boxX, boxY + boxHeight, boxX, boxY, boxWidth, boxHeight),
    0.0,
    'bottom left corner'
  );
  assert.equal(
    getWidthProportionFromLeft(boxX + boxWidth, boxY + boxHeight, boxX, boxY, boxWidth, boxHeight),
    1.0,
    'bottom right corner'
  );
});
