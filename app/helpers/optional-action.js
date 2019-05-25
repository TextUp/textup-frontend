import { helper } from '@ember/component/helper';
import { typeOf } from '@ember/utils';
import callIfPresent from 'textup-frontend/utils/call-if-present';

export const ERROR_NOT_A_FUNCTION = 'First argument to `optional-action` must be a function.';

export function optionalAction([optionalFn, ...otherArgs]) {
  if (typeOf(optionalFn) !== 'function') {
    throw new Error(ERROR_NOT_A_FUNCTION);
  }
  return function() {
    return callIfPresent(null, optionalFn, otherArgs);
  };
}

export default helper(optionalAction);
