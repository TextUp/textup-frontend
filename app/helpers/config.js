import * as PropertyUtils from 'textup-frontend/utils/property';
import configObj from 'textup-frontend/config/environment';
import Ember from 'ember';

export function getConfigVal([valString = '']) {
  return PropertyUtils.mustGet(
    configObj,
    valString + '',
    `No config variable found at '${valString}'`
  );
}

export default Ember.Helper.helper(getConfigVal);
