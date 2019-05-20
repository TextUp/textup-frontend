import { typeOf } from '@ember/utils';
import { isArray } from '@ember/array';
import callIfPresent from 'textup-frontend/utils/call-if-present';

export function normalizeIndex(numItems, index) {
  if (typeOf(index) !== 'number' || typeOf(numItems) !== 'number') {
    return 0;
  } else if (index < 0) {
    return numItems + index;
  } else if (index >= numItems) {
    return index - numItems;
  } else {
    return index;
  }
}

export function ensureArrayAndAllDefined(obj) {
  return ensureAllDefined(ensureArray(obj));
}

export function ensureArray(obj) {
  return isArray(obj) ? obj : [obj];
}

export function ensureAllDefined(obj) {
  return isArray(obj) ? obj.filter(val => val !== null && val !== undefined) : obj;
}

// [FUTURE] remove this sort of chained callback throughout the app
export function tryCallAll(callbacks) {
  ensureArrayAndAllDefined(callbacks).forEach(fn => callIfPresent(null, fn));
}
