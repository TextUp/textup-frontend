import { helper as buildHelper } from '@ember/component/helper';
import { lowercase as doLowercase } from 'textup-frontend/utils/text';

export function lowercase([word] /*, hash*/) {
  return doLowercase(word);
}

export default buildHelper(lowercase);
