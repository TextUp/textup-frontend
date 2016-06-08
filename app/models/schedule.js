import DS from 'ember-data';
import Ember from 'ember';
import {
	daysOfWeek,
	stringToIntervals,
	intervalsToString
} from '../utils/schedule';

const {
	defineProperty,
	computed,
	on,
	set
} = Ember;

export default DS.Model.extend({
	isAvailableNow: DS.attr('boolean'),
	nextAvailable: DS.attr('date'),
	nextUnavailable: DS.attr('date'),

	sundayString: DS.attr('interval-string'),
	mondayString: DS.attr('interval-string'),
	tuesdayString: DS.attr('interval-string'),
	wednesdayString: DS.attr('interval-string'),
	thursdayString: DS.attr('interval-string'),
	fridayString: DS.attr('interval-string'),
	saturdayString: DS.attr('interval-string'),

	// Computed properties
	// -------------------

	defineProperties: on('init', function() {
		daysOfWeek.forEach((dayOfWeek) => {
			const stringProp = `${dayOfWeek}String`;
			defineProperty(this, dayOfWeek, computed(stringProp, {
				get: function() {
					return stringToIntervals(this.get(stringProp));
				},
				set: function(key, intervals) {
					this.set(stringProp, intervalsToString(intervals));
					return intervals;
				}
			}));
		});
	}),

	// Methods
	// -------

	add: function(day, interval) {
		this._doForDay(day, (intervals) => intervals.pushObject(interval));
	},
	remove: function(day, index) {
		this._doForDay(day, (intervals) => intervals.removeAt(index));
	},
	replace: function(day, index, newInterval) {
		this._doForDay(day, (intervals) => set(intervals, String(index), newInterval));
	},

	// Helpers
	// -------

	_doForDay: function(day, action) {
		if (!daysOfWeek.contains(day)) {
			return;
		}
		const intervals = this.get(day);
		action(intervals);
		this.set(day, intervals);
	},
});
