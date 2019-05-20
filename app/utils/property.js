import RSVP from 'rsvp';
import { getWithDefault } from '@ember/object';

const UNDEFINED_OBJ = function() {};

export function mustGet(obj, propName, errorString) {
  const retVal = getWithDefault(obj, propName, UNDEFINED_OBJ);
  if (retVal === UNDEFINED_OBJ) {
    throw new Error(errorString);
  }
  return retVal;
}

export function urlIdent(modelName, id) {
  return `${modelName}-${id}`;
}

// originally from: https://stackoverflow.com/a/28248597
// Modified to not wrap native JS Promises because of testing failures
// see: https://github.com/emberjs/ember.js/issues/15569
// see: https://discuss.emberjs.com/t/why-use-rsvp-promise-instead-of-es6-promises/13568
export function ensurePromise(promise) {
  return promise instanceof window.Promise ? promise : new RSVP.resolve(promise);
}
