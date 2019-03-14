import Constants from 'textup-frontend/constants';
import Ember from 'ember';

const { getWithDefault } = Ember,
  UNDEFINED_OBJ = Object.create();

export function constant([valString]) {
  const retVal = getWithDefault(Constants, valString, UNDEFINED_OBJ);
  if (retVal === UNDEFINED_OBJ) {
    throw new Error(`No constant found at '${valString}'`);
  }
  return retVal;
}

export default Ember.Helper.helper(constant);
