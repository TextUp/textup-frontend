import Ember from 'ember';
import { abbreviate as doAbbreviate } from 'textup-frontend/utils/text';

export function abbreviate([content, maxLength] /*, hash*/) {
  return doAbbreviate(content, maxLength);
}

export default Ember.Helper.helper(abbreviate);
