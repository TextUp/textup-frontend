import DS from 'ember-data';
import Ember from 'ember';
import PhoneNumber from '../mixins/phone-number-serializer';

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, PhoneNumber, {
	attrs: {
		org: {
			deserialize: 'records',
			serialize: 'ids'
		},
		tags: {
			deserialize: 'records',
			serialize: false //any changes happen with tagActions on the individual tags
		},
		teams: {
			deserialize: 'records',
			serialize: false //any changes happen with teamActions on the individual tags
		},
		phoneId: {
			serialize: false
		},
		isAvailableNow: {
			serialize: false
		},
		nextAvailable: {
			serialize: false
		},
		nextUnavailable: {
			serialize: false
		}
	},

	// Overrides
	// ---------

	normalize: function(modelClass, hash) {
		this._doForDayOfWeek(hash.schedule, this._normalizeTimeRange);
		hash = this._unpackSchedule(hash);
		return this._super(...arguments);
	},
	serialize: function() {
		const json = this._super(...arguments);
		this._doForDayOfWeek(json, this._serializeTimeRange);
		json.org = {
			id: json.org
		};
		if (!json.password) {
			delete json.password;
		}
		return this._packSchedule(json);
	},

	// Schedule
	// --------

	_unpackSchedule: function(json) {
		for (let propName in json.schedule) {
			json[propName] = json.schedule[propName];
		}
		delete json.schedule;
		return json;
	},
	_packSchedule: function(json) {
		const schedule = Object.create(null);
		for (let propName in json) {
			if (this._isDayOfWeek(propName)) {
				schedule[propName] = json[propName];
				delete json[propName];
			}
		}
		json.schedule = schedule;
		return json;
	},

	// Helpers
	// -------

	_doForDayOfWeek: function(hash, action) {
		for (let propName in hash) {
			if (this._isDayOfWeek(propName)) {
				const prop = hash[propName];
				if (Ember.isArray(prop)) {
					hash[propName] = Ember.A(prop).map(action);
				}
			}
		}
	},
	_isDayOfWeek: function(propName) {
		return propName && propName.slice(-3) === 'day';
	},
	_normalizeTimeRange: function(timeRange) {
		const rangeObj = timeRange && timeRange.split(':');
		return (rangeObj.length === 2) ? rangeObj : timeRange;
	},
	_serializeTimeRange: function(rangeObj) {
		return `${rangeObj[0]}:${rangeObj[1]}`;
	},
});
