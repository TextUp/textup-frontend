import { helper as buildHelper } from '@ember/component/helper';
import { format } from 'textup-frontend/utils/phone-number';

export function phoneNumber(params /*, hash*/) {
  return format(params[0], false);
}

export default buildHelper(phoneNumber);
