import { isNone } from '@ember/utils';
import { computed } from '@ember/object';
import { isArray } from '@ember/array';

export default function defaultIfAbsent(defaultVal) {
  const copyIfArray = function(defaultVal) {
    return isArray(defaultVal) ? [].slice.call(defaultVal) : defaultVal;
  };
  return computed({
    get() {
      return copyIfArray(defaultVal);
    },
    set(_, val) {
      return isNone(val) ? copyIfArray(defaultVal) : val;
    },
  });
}
