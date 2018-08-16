import Ember from 'ember';
import DS from 'ember-data';

const { typeOf, get } = Ember;

function isAnyObject(item) {
  return typeOf(item) === 'instance' || typeOf(item) === 'object';
}

export default DS.Transform.extend({
  // checking representation of a media element from the api
  deserialize(serialized) {
    if (typeOf(serialized) !== 'array') {
      return [];
    }
    const result = [];
    serialized.forEach(apiItem => {
      if (isAnyObject(apiItem)) {
        const transformedObj = {};
        Object.keys(apiItem).forEach(key => {
          const val = apiItem[key];
          if (isAnyObject(val) && get(val, 'link')) {
            // if a prop is an object and has a link transform it
            transformedObj[key] = {
              source: get(val, 'link'),
              width: get(val, 'width')
            };
          } else {
            // otherwise, just pass it through
            transformedObj[key] = val;
          }
        });
        result.pushObject(transformedObj);
      }
    });
    return result;
  },

  serialize(deserialized) {
    return deserialized;
  }
});
