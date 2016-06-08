import Ember from 'ember';
import defaultIfAbsent from '../../utils/default-if-absent';
import moment from 'moment';
import {
	daysOfWeek
} from '../../utils/schedule';

export default Ember.Component.extend({

	schedule: defaultIfAbsent({}),
	otherStaffs: defaultIfAbsent([]),

	_daysOfWeek: daysOfWeek,

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
		insertTime: function(day, data) {
			this.get('schedule').add(day, data);
		},
		removeTime: function(day, index) {
			this.get('schedule').remove(day, index);
		},
		updateTime: function(day, index, data) {
			this.get('schedule').replace(day, index, data);
		},
	},
});
