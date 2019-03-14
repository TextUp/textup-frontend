import Ember from 'ember';

const { getWithDefault } = Ember,
  UNDEFINED_OBJ = function() {};

export function mustGet(obj, valString, errorString) {
  const retVal = getWithDefault(obj, valString, UNDEFINED_OBJ);
  if (retVal === UNDEFINED_OBJ) {
    throw new Error(errorString);
  }
  return retVal;
}
