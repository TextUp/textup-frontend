import TypeUtils from 'textup-frontend/utils/type';
import Ember from 'ember';

export function typeIsTeam([obj]) {
  return TypeUtils.isTeam(obj);
}

export default Ember.Helper.helper(typeIsTeam);
