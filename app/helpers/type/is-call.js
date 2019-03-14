import * as TypeUtils from 'textup-frontend/utils/type';
import Ember from 'ember';

export function typeIsCall([obj]) {
  return TypeUtils.isCall(obj);
}

export default Ember.Helper.helper(typeIsCall);
