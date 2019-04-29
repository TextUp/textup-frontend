import TypeUtils from 'textup-frontend/utils/type';
import Ember from 'ember';

export function typeIsText([obj]) {
  return TypeUtils.isText(obj);
}

export default Ember.Helper.helper(typeIsText);
