import TypeUtils from 'textup-frontend/utils/type';
import { helper } from '@ember/component/helper';

export function objectValues(obj) {
  return TypeUtils.isAnyObject(obj) ? Object.values(obj) : [];
}

export default helper(objectValues);
