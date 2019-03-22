import Ember from 'ember';

const { getWithDefault } = Ember,
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
