import Ember from 'ember';
import * as TextUtils from 'textup-frontend/utils/text';

export function capitalize([word, numToCap]) {
  return TextUtils.capitalize(word, numToCap);
}

export default Ember.Helper.helper(capitalize);
