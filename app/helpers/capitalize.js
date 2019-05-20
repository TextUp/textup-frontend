import { helper as buildHelper } from '@ember/component/helper';
import TextUtils from 'textup-frontend/utils/text';

export function capitalize([word, numToCap]) {
  return TextUtils.capitalize(word, numToCap);
}

export default buildHelper(capitalize);
