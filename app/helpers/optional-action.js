import { helper } from '@ember/component/helper';
import { typeOf } from '@ember/utils';

export const ERROR_NOT_A_FUNCTION = 'First argument to `optional-action` must be a function.';

export function optionalAction([optionalFn, ...otherArgs]) {
  if (typeOf(optionalFn) !== 'function') {
    throw new Error(ERROR_NOT_A_FUNCTION);
  }
  return function() {
    return PropertyUtils.callIfPresent(optionalFn, otherArgs);
  };
}

export default helper(optionalAction);
