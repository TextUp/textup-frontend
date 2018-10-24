import Ember from 'ember';

const { typeOf } = Ember;

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
