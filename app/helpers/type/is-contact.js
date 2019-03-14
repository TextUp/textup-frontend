import * as TypeUtils from 'textup-frontend/utils/type';
import Ember from 'ember';

export function typeIsContact([obj]) {
  return TypeUtils.isContact(obj);
}

export default Ember.Helper.helper(typeIsContact);
