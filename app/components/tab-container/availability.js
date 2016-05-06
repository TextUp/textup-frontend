import Ember from 'ember';
import defaultIfAbsent from '../../utils/default-if-absent';
import moment from 'moment';

export default Ember.Component.extend({

	schedule: defaultIfAbsent({}),
	otherStaffs: defaultIfAbsent([]),

	_daysOfWeek: [
		'monday', 'tuesday', 'wednesday', 'thursday', 'friday',
		'saturday', 'sunday'
	],

	// Computed properties
	// -------------------

	dayToday: Ember.computed(function() {
		return moment().format('dddd').toLowerCase();
	}),

	// Actions
	// -------

	actions: {
		doRawToValid: function(raw) {
			return moment(raw, 'HHmm').format('LT');
		},
		doValidToRaw: function(valid) {
			return moment(valid, 'LT').format('HHmm');
		},
		doValidToNum: function(valid) {
			return moment(valid, 'LT').unix();
		},
		doNumToValid: function(num) {
			return moment(num, 'X').format('LT');
		},
		doValidRangeToDisplay: function(validRange) {
			return `${validRange[0]} to ${validRange[1]}`;
		},
		doIndicator: function(rangeBar, indicator, doRecalc) {
			if (doRecalc) { // only passed the first time
				setInterval(doRecalc, 1000 * 60);
			}
			return moment().format('LT');
		},
		updateTime: function(array, index, data) {
			Ember.set(array, String(index), data);
		},
		insertTime: function(array, data) {
			array.pushObject(data);
		},
		removeTime: function(array, index) {
			array.removeAt(index);
		},
	}
});
