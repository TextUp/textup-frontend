import Ember from 'ember';
import DS from 'ember-data';

const { $, typeOf } = Ember;

export default DS.Transform.extend({
  deserialize: function(serialized) {
    return typeOf(serialized) === 'array' ? serialized : [];
  },

  serialize: function(deserialized) {
    switch (typeOf(deserialized)) {
      case 'array':
        return deserialized;
      case 'string':
        return deserialized.split(',').map($.trim);
      default:
        return [];
    }
  }
});
