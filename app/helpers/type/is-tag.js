import TypeUtils from 'textup-frontend/utils/type';
import Ember from 'ember';

export function typeIsTag([obj]) {
  return TypeUtils.isTag(obj);
}

export default Ember.Helper.helper(typeIsTag);
