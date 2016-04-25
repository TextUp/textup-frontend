import Ember from 'ember';

export default function defaultIfAbsent(defaultVal) {
	const copyIfArray = function(defaultVal) {
		return Ember.isArray(defaultVal) ? [].slice.call(defaultVal) : defaultVal;
	};
	return Ember.computed({
		get: function() {
			return copyIfArray(defaultVal);
		},
		set: function(_, val) {
			return Ember.isNone(val) ? copyIfArray(defaultVal) : val;
		}
	});
}
