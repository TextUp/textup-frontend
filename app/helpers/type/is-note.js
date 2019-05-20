import { helper as buildHelper } from '@ember/component/helper';
import TypeUtils from 'textup-frontend/utils/type';

export function typeIsNote([obj]) {
  return TypeUtils.isNote(obj);
}

export default buildHelper(typeIsNote);
