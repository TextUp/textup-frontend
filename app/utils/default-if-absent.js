import Ember from 'ember';

export default function defaultIfAbsent(defaultVal) {
  const copyIfArray = function(defaultVal) {
    return Ember.isArray(defaultVal) ? [].slice.call(defaultVal) : defaultVal;
  };
  return Ember.computed({
    get() {
      return copyIfArray(defaultVal);
    },
    set(_, val) {
      return Ember.isNone(val) ? copyIfArray(defaultVal) : val;
    },
  });
}
