import { helper as buildHelper } from '@ember/component/helper';
import TypeUtils from 'textup-frontend/utils/type';

export function typeIsTag([obj]) {
  return TypeUtils.isTag(obj);
}

export default buildHelper(typeIsTag);
