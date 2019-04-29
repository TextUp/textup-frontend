import Ember from 'ember';

const { RSVP, getWithDefault } = Ember,
  UNDEFINED_OBJ = function() {};

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

// from: https://stackoverflow.com/a/28248597
export function ensurePromise(promise) {
  return new RSVP.Promise(resolve => resolve(promise));
}
