import TypeUtils from 'textup-frontend/utils/type';
import Ember from 'ember';

export function typeIsNote([obj]) {
  return TypeUtils.isNote(obj);
}

export default Ember.Helper.helper(typeIsNote);
