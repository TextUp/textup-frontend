import { helper as buildHelper } from '@ember/component/helper';
import { abbreviate as doAbbreviate } from 'textup-frontend/utils/text';

export function abbreviate([content, maxLength] /*, hash*/) {
  return doAbbreviate(content, maxLength);
}

export default buildHelper(abbreviate);
