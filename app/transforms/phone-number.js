import DS from 'ember-data';
import {
	clean,
	validate
} from '../utils/phone-number';

export default DS.Transform.extend({
	deserialize: function(serialized) {
		return validate(serialized) ? clean(serialized) : '';
	},
	serialize: function(deserialized) {
		return deserialized;
	}
});
