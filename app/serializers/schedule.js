import DS from 'ember-data';
import Ember from 'ember';

export default DS.RESTSerializer.extend({

	// Overrides
	// ---------

	normalize: function(modelClass, hash) {
		this._doForArray(hash, this._normalizeTimeRange);
		return this._super(...arguments);
	},
	serialize: function() {
		const json = this._super(...arguments);
		this._doForArray(json, this._serializeTimeRange);
		return json;
	},

	// Helpers
	// -------

	_doForArray: function(hash, action) {
		for (let propName in hash) {
			const prop = hash[propName];
			if (Ember.isArray(prop)) {
				hash[propName] = Ember.A(prop).map(action);
			}
		}
	},
	_normalizeTimeRange: function(timeRange) {
		const rangeObj = timeRange && timeRange.split(':');
		return (rangeObj.length === 2) ? rangeObj : timeRange;
	},
	_serializeTimeRange: function(rangeObj) {
		return `${rangeObj[0]}:${rangeObj[1]}`;
	},
});
