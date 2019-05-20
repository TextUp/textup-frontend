import { helper as buildHelper } from '@ember/component/helper';
import TypeUtils from 'textup-frontend/utils/type';

export function typeIsCall([obj]) {
  return TypeUtils.isCall(obj);
}

export default buildHelper(typeIsCall);
