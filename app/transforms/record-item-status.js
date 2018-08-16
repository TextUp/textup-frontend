import Ember from 'ember';
import DS from 'ember-data';

const { typeOf, get } = Ember;

function ensureIsArray(obj) {
  return typeOf(obj) === 'array' ? obj : [];
}

export default DS.Transform.extend({
  deserialize(serialized) {
    if (typeOf(serialized) === 'instance' || typeOf(serialized) === 'object') {
      return {
        success: ensureIsArray(get(serialized, 'success')),
        pending: ensureIsArray(get(serialized, 'pending')),
        busy: ensureIsArray(get(serialized, 'busy')),
        failed: ensureIsArray(get(serialized, 'failed'))
      };
    } else {
      return {
        success: [],
        pending: [],
        busy: [],
        failed: []
      };
    }
  },

  serialize(deserialized) {
    return deserialized;
  }
});
