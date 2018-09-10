import Ember from 'ember';
import { format } from 'textup-frontend/utils/phone-number';

export function phoneNumber(params /*, hash*/) {
  return format(params[0], false);
}

export default Ember.Helper.helper(phoneNumber);
