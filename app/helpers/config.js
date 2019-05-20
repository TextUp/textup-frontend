import { helper as buildHelper } from '@ember/component/helper';
import PropertyUtils from 'textup-frontend/utils/property';
import configObj from 'textup-frontend/config/environment';

export function getConfigVal([valString = '']) {
  return PropertyUtils.mustGet(
    configObj,
    valString + '',
    `No config variable found at '${valString}'`
  );
}

export default buildHelper(getConfigVal);
