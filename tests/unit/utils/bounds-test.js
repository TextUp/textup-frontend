import * as BoundUtils from 'textup-frontend/utils/bounds';
import { module, test } from 'qunit';

module('Unit | Utility | bounds');

test('getting width proportion from left', function(assert) {
  assert.equal(BoundUtils.getWidthProportionFromLeft(), 0.0, 'missing inputs');
  assert.equal(
    BoundUtils.getWidthProportionFromLeft(2, 2, 2, 2, 2, 'not number'),
    0.0,
    'not all inputs are numbers'
  );
  assert.equal(
    BoundUtils.getWidthProportionFromLeft(2, 2, -2, 2, 2, 2),
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
    BoundUtils.getWidthProportionFromLeft(0, inBoundsY, boxX, boxY, boxWidth, boxHeight),
    0.0,
    'out of bounds on left'
  );
  assert.equal(
    BoundUtils.getWidthProportionFromLeft(inBoundsX, 0, boxX, boxY, boxWidth, boxHeight),
    0.0,
    'out of bounds on top'
  );
  assert.equal(
    BoundUtils.getWidthProportionFromLeft(
      exceedBoundsX,
      inBoundsY,
      boxX,
      boxY,
      boxWidth,
      boxHeight
    ),
    0.0,
    'out of bounds on right'
  );
  assert.equal(
    BoundUtils.getWidthProportionFromLeft(
      inBoundsX,
      exceedBoundsY,
      boxX,
      boxY,
      boxWidth,
      boxHeight
    ),
    0.0,
    'out of bounds on bottom'
  );

  assert.equal(
    BoundUtils.getWidthProportionFromLeft(0, 0, boxX, boxY, boxWidth, boxHeight),
    0.0,
    'out of bounds on top left'
  );
  assert.equal(
    BoundUtils.getWidthProportionFromLeft(0, exceedBoundsX, boxX, boxY, boxWidth, boxHeight),
    0.0,
    'out of bounds on top right'
  );
  assert.equal(
    BoundUtils.getWidthProportionFromLeft(exceedBoundsY, 0, boxX, boxY, boxWidth, boxHeight),
    0.0,
    'out of bounds on bottom left'
  );
  assert.equal(
    BoundUtils.getWidthProportionFromLeft(
      exceedBoundsY,
      exceedBoundsX,
      boxX,
      boxY,
      boxWidth,
      boxHeight
    ),
    0.0,
    'out of bounds on bottom right'
  );

  assert.equal(
    BoundUtils.getWidthProportionFromLeft(inBoundsX, inBoundsY, boxX, boxY, boxWidth, boxHeight),
    (inBoundsX - boxX) / boxWidth,
    'within bounds somewhere in center'
  );

  assert.equal(
    BoundUtils.getWidthProportionFromLeft(boxX, inBoundsY, boxX, boxY, boxWidth, boxHeight),
    0.0,
    'very left edge of bounds'
  );
  assert.equal(
    BoundUtils.getWidthProportionFromLeft(
      boxX + boxWidth,
      inBoundsY,
      boxX,
      boxY,
      boxWidth,
      boxHeight
    ),
    1.0,
    'very right edge of bounds'
  );

  assert.equal(
    BoundUtils.getWidthProportionFromLeft(boxX, boxY, boxX, boxY, boxWidth, boxHeight),
    0.0,
    'top left corner'
  );
  assert.equal(
    BoundUtils.getWidthProportionFromLeft(boxX + boxWidth, boxY, boxX, boxY, boxWidth, boxHeight),
    1.0,
    'top right corner'
  );
  assert.equal(
    BoundUtils.getWidthProportionFromLeft(boxX, boxY + boxHeight, boxX, boxY, boxWidth, boxHeight),
    0.0,
    'bottom left corner'
  );
  assert.equal(
    BoundUtils.getWidthProportionFromLeft(
      boxX + boxWidth,
      boxY + boxHeight,
      boxX,
      boxY,
      boxWidth,
      boxHeight
    ),
    1.0,
    'bottom right corner'
  );
});

test('checking viewport space vertically', function(assert) {
  assert.equal(BoundUtils.hasMoreViewportSpaceOnTop(), null);
  assert.equal(BoundUtils.hasMoreViewportSpaceOnTop(null), null);
  assert.equal(BoundUtils.hasMoreViewportSpaceOnTop('not an object'), null);

  assert.equal(
    BoundUtils.hasMoreViewportSpaceOnTop(withBoundingRect({ top: 800, height: 100 })),
    true
  );
  assert.equal(
    BoundUtils.hasMoreViewportSpaceOnTop(withBoundingRect({ top: 0, height: 100 })),
    false
  );
});

test('checking viewport space horizontally', function(assert) {
  assert.equal(BoundUtils.shouldAlignToLeftEdge(), null);
  assert.equal(BoundUtils.shouldAlignToLeftEdge(null), null);
  assert.equal(BoundUtils.shouldAlignToLeftEdge('not an object'), null);

  assert.equal(
    BoundUtils.shouldAlignToLeftEdge(withBoundingRect({ left: 800, width: 100 })),
    false
  );
  assert.equal(BoundUtils.shouldAlignToLeftEdge(withBoundingRect({ left: 0, width: 100 })), true);
});

test('floating and dimension style invalid inputs', function(assert) {
  assert.deepEqual(BoundUtils.buildVerticalFloatingStyles(), []);
  assert.deepEqual(
    BoundUtils.buildVerticalFloatingStyles('not bool', 'not bool', 'not obj', 'not obj'),
    []
  );
  assert.deepEqual(
    BoundUtils.buildVerticalFloatingStyles(true, true, {}, {}),
    [],
    'objects need to have getBoundingClientRect function'
  );

  assert.deepEqual(BoundUtils.buildVerticalDimensionStyles(), []);
  assert.deepEqual(
    BoundUtils.buildVerticalDimensionStyles('not bool', 'not bool', 'not obj', 'not obj'),
    []
  );
  assert.deepEqual(
    BoundUtils.buildVerticalDimensionStyles(true, true, {}, {}),
    [],
    'objects need to have getBoundingClientRect function'
  );
});

test('building floating and dimension styles for top/left', function(assert) {
  const viewportWidth = $(window).innerWidth();

  let triggerEl = withBoundingRect({ top: 500, left: 500, width: 100, height: 100 });
  let bodyEl = { scrollWidth: 200, scrollHeight: 100 };
  let floatingStyles = BoundUtils.buildVerticalFloatingStyles.call(
    this,
    true,
    true,
    triggerEl,
    bodyEl
  );
  let dimensionStyles = BoundUtils.buildVerticalDimensionStyles.call(
    this,
    true,
    true,
    triggerEl,
    bodyEl
  );

  assert.equal(floatingStyles.length, 2);
  assert.equal(dimensionStyles.length, 0, 'no max dimensions because no overflow');
  assert.equal(
    floatingStyles.find(style => style.indexOf('top') > -1),
    'top: 400px',
    'triggerTop - bodyHeight'
  );
  assert.equal(
    floatingStyles.find(style => style.indexOf('left') > -1),
    'left: 500px',
    'aligned to left edge = triggerLeft'
  );

  triggerEl = withBoundingRect({ top: 500, left: 500, width: 100, height: 100 });
  bodyEl = { scrollWidth: 200, scrollHeight: 600 };
  floatingStyles = BoundUtils.buildVerticalFloatingStyles.call(this, true, true, triggerEl, bodyEl);
  dimensionStyles = BoundUtils.buildVerticalDimensionStyles.call(
    this,
    true,
    true,
    triggerEl,
    bodyEl
  );

  assert.equal(floatingStyles.length, 2);
  assert.equal(dimensionStyles.length, 1, 'has vertical overflow');
  assert.equal(
    floatingStyles.find(style => style.indexOf('top') > -1),
    `top: ${BoundUtils.EDGE_GUTTER_SIZE_IN_PX}px`,
    'top edge because vertical overflow'
  );
  assert.equal(
    floatingStyles.find(style => style.indexOf('left') > -1),
    'left: 500px',
    'aligned to left edge = triggerLeft'
  );
  assert.equal(
    dimensionStyles.find(style => style.indexOf('max-height') > -1),
    `max-height: ${500 - BoundUtils.EDGE_GUTTER_SIZE_IN_PX}px`,
    'triggerTop'
  );

  triggerEl = withBoundingRect({ top: 500, left: 500, width: 100, height: 100 });
  bodyEl = { scrollWidth: 2000, scrollHeight: 600 };
  floatingStyles = BoundUtils.buildVerticalFloatingStyles.call(this, true, true, triggerEl, bodyEl);
  dimensionStyles = BoundUtils.buildVerticalDimensionStyles.call(
    this,
    true,
    true,
    triggerEl,
    bodyEl
  );

  assert.equal(floatingStyles.length, 2);
  assert.equal(dimensionStyles.length, 2, 'both vertical and horizontal overflow');
  assert.equal(
    floatingStyles.find(style => style.indexOf('top') > -1),
    `top: ${BoundUtils.EDGE_GUTTER_SIZE_IN_PX}px`,
    'top edge because vertical overflow'
  );
  assert.equal(
    floatingStyles.find(style => style.indexOf('left') > -1),
    'left: 500px',
    'aligned to left edge = triggerLeft'
  );
  assert.equal(
    dimensionStyles.find(style => style.indexOf('max-height') > -1),
    `max-height: ${500 - BoundUtils.EDGE_GUTTER_SIZE_IN_PX}px`,
    'triggerTop'
  );
  assert.equal(
    dimensionStyles.find(style => style.indexOf('max-width') > -1),
    `max-width: ${viewportWidth - 500 - BoundUtils.EDGE_GUTTER_SIZE_IN_PX}px`,
    'viewportWidth - triggerLeft'
  );
});

test('building floating and dimension styles for top/right', function(assert) {
  let triggerEl = withBoundingRect({ top: 500, left: 500, width: 100, height: 100 });
  let bodyEl = { scrollWidth: 200, scrollHeight: 100 };
  let floatingStyles = BoundUtils.buildVerticalFloatingStyles.call(
    this,
    true,
    false,
    triggerEl,
    bodyEl
  );
  let dimensionStyles = BoundUtils.buildVerticalDimensionStyles.call(
    this,
    true,
    false,
    triggerEl,
    bodyEl
  );

  assert.equal(floatingStyles.length, 2);
  assert.equal(dimensionStyles.length, 0);
  assert.equal(
    floatingStyles.find(style => style.indexOf('top') > -1),
    'top: 400px',
    'triggerTop - bodyHeight'
  );
  assert.equal(
    floatingStyles.find(style => style.indexOf('left') > -1),
    'left: 400px',
    'triggerLeft + triggerWidth - bodyWidth'
  );

  triggerEl = withBoundingRect({ top: 500, left: 500, width: 100, height: 100 });
  bodyEl = { scrollWidth: 2000, scrollHeight: 1000 };
  floatingStyles = BoundUtils.buildVerticalFloatingStyles.call(
    this,
    true,
    false,
    triggerEl,
    bodyEl
  );
  dimensionStyles = BoundUtils.buildVerticalDimensionStyles.call(
    this,
    true,
    false,
    triggerEl,
    bodyEl
  );

  assert.equal(floatingStyles.length, 2);
  assert.equal(dimensionStyles.length, 2, 'overflow both directions');
  assert.equal(
    floatingStyles.find(style => style.indexOf('top') > -1),
    `top: ${BoundUtils.EDGE_GUTTER_SIZE_IN_PX}px`,
    'overflow top'
  );
  assert.equal(
    floatingStyles.find(style => style.indexOf('left') > -1),
    `left: ${BoundUtils.EDGE_GUTTER_SIZE_IN_PX}px`,
    'overflow left'
  );
  assert.equal(
    dimensionStyles.find(style => style.indexOf('max-height') > -1),
    `max-height: ${500 - BoundUtils.EDGE_GUTTER_SIZE_IN_PX}px`,
    'triggerTop'
  );
  assert.equal(
    dimensionStyles.find(style => style.indexOf('max-width') > -1),
    `max-width: ${600 - BoundUtils.EDGE_GUTTER_SIZE_IN_PX}px`,
    'triggerLeft + triggerWidth'
  );
});

test('building floating and dimension styles for bottom/left', function(assert) {
  const viewportHeight = $(window).innerHeight(),
    viewportWidth = $(window).innerWidth();

  let triggerEl = withBoundingRect({ top: 500, left: 500, width: 100, height: 100 });
  let bodyEl = { scrollWidth: 200, scrollHeight: 100 };
  let floatingStyles = BoundUtils.buildVerticalFloatingStyles.call(
    this,
    false,
    true,
    triggerEl,
    bodyEl
  );
  let dimensionStyles = BoundUtils.buildVerticalDimensionStyles.call(
    this,
    false,
    true,
    triggerEl,
    bodyEl
  );

  assert.equal(floatingStyles.length, 2);
  assert.equal(dimensionStyles.length, 0);
  assert.equal(
    floatingStyles.find(style => style.indexOf('top') > -1),
    'top: 600px',
    'triggerTop + triggerHeight'
  );
  assert.equal(
    floatingStyles.find(style => style.indexOf('left') > -1),
    'left: 500px',
    'triggerLeft'
  );

  triggerEl = withBoundingRect({ top: 500, left: 500, width: 100, height: 100 });
  bodyEl = { scrollWidth: 2000, scrollHeight: 1000 };
  floatingStyles = BoundUtils.buildVerticalFloatingStyles.call(
    this,
    false,
    true,
    triggerEl,
    bodyEl
  );
  dimensionStyles = BoundUtils.buildVerticalDimensionStyles.call(
    this,
    false,
    true,
    triggerEl,
    bodyEl
  );

  assert.equal(floatingStyles.length, 2);
  assert.equal(dimensionStyles.length, 2, 'overflow both directions');
  assert.equal(
    floatingStyles.find(style => style.indexOf('top') > -1),
    'top: 600px',
    'triggerTop + triggerHeight'
  );
  assert.equal(
    floatingStyles.find(style => style.indexOf('left') > -1),
    'left: 500px',
    'triggerLeft'
  );
  assert.equal(
    dimensionStyles.find(style => style.indexOf('max-height') > -1),
    `max-height: ${viewportHeight - 500 - 100 - BoundUtils.EDGE_GUTTER_SIZE_IN_PX}px`,
    'viewportHeight - triggerTop - triggerHeight'
  );
  assert.equal(
    dimensionStyles.find(style => style.indexOf('max-width') > -1),
    `max-width: ${viewportWidth - 500 - BoundUtils.EDGE_GUTTER_SIZE_IN_PX}px`,
    'viewportWidth - triggerLeft'
  );
});

test('building floating and dimension styles for bottom/right', function(assert) {
  const viewportHeight = $(window).innerHeight();

  let triggerEl = withBoundingRect({ top: 500, left: 500, width: 100, height: 100 });
  let bodyEl = { scrollWidth: 200, scrollHeight: 100 };
  let floatingStyles = BoundUtils.buildVerticalFloatingStyles.call(
    this,
    false,
    false,
    triggerEl,
    bodyEl
  );
  let dimensionStyles = BoundUtils.buildVerticalDimensionStyles.call(
    this,
    false,
    false,
    triggerEl,
    bodyEl
  );

  assert.equal(floatingStyles.length, 2);
  assert.equal(dimensionStyles.length, 0);
  assert.equal(
    floatingStyles.find(style => style.indexOf('top') > -1),
    'top: 600px',
    'triggerTop + triggerHeight'
  );
  assert.equal(
    floatingStyles.find(style => style.indexOf('left') > -1),
    `left: ${500 + 100 - 200}px`,
    'triggerLeft + triggerWidth - bodyWidth'
  );

  triggerEl = withBoundingRect({ top: 500, left: 500, width: 100, height: 100 });
  bodyEl = { scrollWidth: 2000, scrollHeight: 1000 };
  floatingStyles = BoundUtils.buildVerticalFloatingStyles.call(
    this,
    false,
    false,
    triggerEl,
    bodyEl
  );
  dimensionStyles = BoundUtils.buildVerticalDimensionStyles.call(
    this,
    false,
    false,
    triggerEl,
    bodyEl
  );

  assert.equal(floatingStyles.length, 2);
  assert.equal(dimensionStyles.length, 2, 'overflow both directions');
  assert.equal(
    floatingStyles.find(style => style.indexOf('top') > -1),
    'top: 600px',
    'triggerTop + triggerHeight'
  );
  assert.equal(
    floatingStyles.find(style => style.indexOf('left') > -1),
    `left: ${BoundUtils.EDGE_GUTTER_SIZE_IN_PX}px`,
    'overflow right'
  );
  assert.equal(
    dimensionStyles.find(style => style.indexOf('max-height') > -1),
    `max-height: ${viewportHeight - 500 - 100 - BoundUtils.EDGE_GUTTER_SIZE_IN_PX}px`,
    'viewportHeight - triggerTop - triggerHeight'
  );
  assert.equal(
    dimensionStyles.find(style => style.indexOf('max-width') > -1),
    `max-width: ${500 + 100 - BoundUtils.EDGE_GUTTER_SIZE_IN_PX}px`,
    'triggerLeft + triggerWidth'
  );
});

function withBoundingRect(bounds) {
  return { getBoundingClientRect: () => bounds };
}
