import { helper as buildHelper } from '@ember/component/helper';
import TypeUtils from 'textup-frontend/utils/type';

export function typeIsText([obj]) {
  return TypeUtils.isText(obj);
}

export default buildHelper(typeIsText);
