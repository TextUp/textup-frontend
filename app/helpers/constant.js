import PropertyUtils from 'textup-frontend/utils/property';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';

export function getConstantVal([valString = '']) {
  return PropertyUtils.mustGet(Constants, valString + '', `No constant found at '${valString}'`);
}

export default Ember.Helper.helper(getConstantVal);
