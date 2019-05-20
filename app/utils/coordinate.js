import { isArray } from '@ember/array';
import { isPresent } from '@ember/utils';
import { get } from '@ember/object';

export function distance(coord1, coord2) {
  const xDist = getX(coord1) - getX(coord2),
    yDist = getY(coord1) - getY(coord2);
  return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
}

function getX(coord) {
  return isPresent(coord) ? (isArray(coord) ? coord[0] : get(coord, 'x')) : NaN;
}

function getY(coord) {
  return isPresent(coord) ? (isArray(coord) ? coord[1] : get(coord, 'y')) : NaN;
}
