import DS from 'ember-data';
import {
	apiFormatToString,
	stringToApiFormat
} from '../utils/schedule';

export default DS.Transform.extend({
	deserialize: apiFormatToString,
	serialize: stringToApiFormat
});
