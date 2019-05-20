import { helper as buildHelper } from '@ember/component/helper';
import TypeUtils from 'textup-frontend/utils/type';

export function typeIsContact([obj]) {
  return TypeUtils.isContact(obj);
}

export default buildHelper(typeIsContact);
