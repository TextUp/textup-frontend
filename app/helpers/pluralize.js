import { helper as buildHelper } from '@ember/component/helper';
import { pluralize as doPluralize } from 'textup-frontend/utils/text';

export function pluralize([word, count] /*, hash*/) {
  return doPluralize(word, count);
}

export default buildHelper(pluralize);
