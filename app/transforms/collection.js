import $ from 'jquery';
import { typeOf } from '@ember/utils';
import DS from 'ember-data';

export default DS.Transform.extend({
  deserialize(serialized) {
    return typeOf(serialized) === 'array' ? serialized : [];
  },

  serialize(deserialized) {
    switch (typeOf(deserialized)) {
      case 'array':
        return deserialized;
      case 'string':
        return deserialized.split(',').map($.trim);
      default:
        return [];
    }
  },
});
