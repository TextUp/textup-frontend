import RSVP from 'rsvp';
import TypeUtils from 'textup-frontend/utils/type';
import { getWithDefault } from '@ember/object';
import { typeOf } from '@ember/utils';

const UNDEFINED_OBJ = function() {};

export function mustGet(obj, propName, errorString) {
  const retVal = getWithDefault(obj, propName, UNDEFINED_OBJ);
  if (retVal === UNDEFINED_OBJ) {
    throw new Error(errorString);
  }
  return retVal;
}

// TODO propagate
export function tryInvoke(obj, propName, args) {
  if (TypeUtils.isAnyObject(obj)) {
    const retVal = get(obj, propName);
    if (typeOf(retVal) === 'function') {
      return retVal.apply(obj, args);
    }
  }
}

// TODO propagate
export function callIfPresent(fn, args) {
  return typeOf(fn) === 'function' ? fn.apply(null, args) : undefined;
}

export function urlIdent(modelName, id) {
  return `${modelName}-${id}`;
}

// originally from: https://stackoverflow.com/a/28248597
// Modified to not wrap native JS Promises because of testing failures
// see: https://github.com/emberjs/ember.js/issues/15569
// see: https://discuss.emberjs.com/t/why-use-rsvp-promise-instead-of-es6-promises/13568
export function ensurePromise(promise) {
  return promise instanceof window.Promise ? promise : RSVP.resolve(promise);
}
