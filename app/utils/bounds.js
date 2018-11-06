import Ember from 'ember';

const { $, typeOf } = Ember;

export function getWidthProportionFromLeft(eventX, eventY, boxX, boxY, boxWidth, boxHeight) {
  // return on invalid args
  if (
    arguments.length < 6 ||
    [...arguments].any(arg => isNaN(parseInt(arg)) || typeOf(parseInt(arg)) !== 'number' || arg < 0)
  ) {
    return 0;
  }
  // 0 if out of bounds vertically
  if (eventY < boxY || eventY > boxY + boxHeight) {
    return 0;
  }
  // 0 if out of bounds horizontally
  if (eventX < boxX || eventX > boxX + boxWidth) {
    return 0;
  }
  const widthProportion = Math.max(eventX - boxX, 0) / boxWidth;
  // ensure proportion is between 0 and 1
  return Math.min(Math.max(widthProportion, 0), 1);
}

// Dropdown positioning utils
// --------------------------

export function hasMoreViewportSpaceOnTop(triggerElement) {
  if (!hasBoundingClientRect(triggerElement)) {
    return null;
  }
  const viewportHeight = $(window).innerHeight(),
    { top, height } = triggerElement.getBoundingClientRect();
  return top > viewportHeight - top - height;
}
export function shouldAlignToLeftEdge(triggerElement) {
  if (!hasBoundingClientRect(triggerElement)) {
    return null;
  }
  const viewportWidth = $(window).innerWidth(),
    { left, width } = triggerElement.getBoundingClientRect();
  return left < viewportWidth - left - width;
}

export const EDGE_GUTTER_SIZE_IN_PX = 30;
export function buildFloatingStyles(isTop, alignToLeftEdge, triggerElement, bodyElement) {
  const styles = [];
  if (!styleInputsAreValid(isTop, alignToLeftEdge, triggerElement, bodyElement)) {
    return styles;
  }
  const space = getSpaceOnAllSides(triggerElement),
    triggerDim = triggerElement.getBoundingClientRect(),
    bodyDim = getBodyDimensions(bodyElement);
  styles.pushObject(buildTop(isTop, space.top, triggerDim.height, bodyDim.height));
  styles.pushObject(buildLeft(alignToLeftEdge, space.left, triggerDim.width, bodyDim.width));
  return styles;
}
export function buildDimensionStyles(isTop, alignToLeftEdge, triggerElement, bodyElement) {
  const styles = [];
  if (!styleInputsAreValid(isTop, alignToLeftEdge, triggerElement, bodyElement)) {
    return styles;
  }
  const space = getSpaceOnAllSides(triggerElement),
    triggerDim = triggerElement.getBoundingClientRect(),
    bodyDim = getBodyDimensions(bodyElement),
    maxHeight = tryBuildMaxHeight(isTop ? space.top : space.bottom, bodyDim.height),
    maxWidth = tryBuildMaxWidth(
      alignToLeftEdge ? space.right : space.left,
      triggerDim.width,
      bodyDim.width
    );
  if (maxHeight) {
    styles.pushObject(maxHeight);
  }
  if (maxWidth) {
    styles.pushObject(maxWidth);
  }
  return styles;
}

function styleInputsAreValid(isTop, alignToLeftEdge, triggerElement, bodyElement) {
  return (
    typeOf(isTop) === 'boolean' &&
    typeOf(alignToLeftEdge) === 'boolean' &&
    hasBoundingClientRect(triggerElement) &&
    typeOf(bodyElement) === 'object'
  );
}
function hasBoundingClientRect(obj) {
  return typeOf(obj) === 'object' && typeOf(obj.getBoundingClientRect) === 'function';
}

function getSpaceOnAllSides(triggerElement) {
  const { top, left, width, height } = triggerElement.getBoundingClientRect(),
    $viewport = $(window),
    viewportHeight = $viewport.innerHeight(),
    viewportWidth = $viewport.innerWidth();
  return {
    top: Math.max(0, top),
    left: Math.max(0, left),
    bottom: Math.max(0, viewportHeight - height - top),
    right: Math.max(0, viewportWidth - width - left)
  };
}
// so that we can get the full overflowed dimensions of the body
// see https://javascript.info/size-and-scroll#scrollwidth-height
function getBodyDimensions(bodyElement) {
  return { width: bodyElement.scrollWidth, height: bodyElement.scrollHeight };
}

function buildTop(isTop, spaceOnTop, triggerHeight, bodyHeight) {
  const topCoord = isTop
    ? Math.max(EDGE_GUTTER_SIZE_IN_PX, spaceOnTop - bodyHeight)
    : spaceOnTop + triggerHeight;
  return `top: ${topCoord}px`;
}
function buildLeft(alignToLeftEdge, spaceOnLeft, triggerWidth, bodyWidth) {
  const leftCoord = alignToLeftEdge
    ? spaceOnLeft
    : Math.max(EDGE_GUTTER_SIZE_IN_PX, spaceOnLeft + triggerWidth - bodyWidth);
  return `left: ${leftCoord}px`;
}

function tryBuildMaxHeight(space, bodyHeight) {
  const remainingSpace = space - EDGE_GUTTER_SIZE_IN_PX;
  if (bodyHeight > remainingSpace) {
    const maxHeight = Math.max(0, remainingSpace);
    return `max-height: ${maxHeight}px`;
  } else {
    return '';
  }
}
function tryBuildMaxWidth(space, triggerWidth, bodyWidth) {
  const remainingSpace = space + triggerWidth - EDGE_GUTTER_SIZE_IN_PX;
  if (bodyWidth > remainingSpace) {
    const maxWidth = Math.max(0, remainingSpace);
    return `max-width: ${maxWidth}px`;
  } else {
    return '';
  }
}
