import { helper as buildHelper } from '@ember/component/helper';
import TypeUtils from 'textup-frontend/utils/type';

export function typeIsTeam([obj]) {
  return TypeUtils.isTeam(obj);
}

export default buildHelper(typeIsTeam);
