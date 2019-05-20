import { helper as buildHelper } from '@ember/component/helper';
import PropertyUtils from 'textup-frontend/utils/property';
import Constants from 'textup-frontend/constants';

export function getConstantVal([valString = '']) {
  return PropertyUtils.mustGet(Constants, valString + '', `No constant found at '${valString}'`);
}

export default buildHelper(getConstantVal);
