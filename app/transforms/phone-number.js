import DS from 'ember-data';
import { clean, validate } from 'textup-frontend/utils/phone-number';

export default DS.Transform.extend({
  deserialize(serialized) {
    return validate(serialized) ? clean(serialized) : '';
  },
  serialize(deserialized) {
    return deserialized;
  },
});
