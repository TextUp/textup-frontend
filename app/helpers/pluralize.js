import Ember from 'ember';
import { pluralize as doPluralize } from 'textup-frontend/utils/text';

export function pluralize([word, count] /*, hash*/) {
  return doPluralize(word, count);
}

export default Ember.Helper.helper(pluralize);
