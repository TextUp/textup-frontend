import Ember from 'ember';
import defaultIfAbsent from '../../utils/default-if-absent';
import moment from 'moment';

export default Ember.Component.extend({

	staff: defaultIfAbsent({}),
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
		updateTime: function(day, index, data) {
			const array = this._copyRangesIfOriginal(this.get('staff'), day);
			Ember.set(array, String(index), data);
		},
		insertTime: function(day, data) {
			const array = this._copyRangesIfOriginal(this.get('staff'), day);
			array.pushObject(data);
		},
		removeTime: function(day, index) {
			const array = this._copyRangesIfOriginal(this.get('staff'), day);
			array.removeAt(index);
		},
	},

	// need to do this to use ember data's dirty tracking
	_copyRangesIfOriginal: function(model, day) {
		const ranges = model.get(day);
		if (Ember.get(model.changedAttributes(), day)) {
			return ranges;
		} else {
			const newRanges = Ember.copy(ranges, true); // deep copy
			model.set(day, newRanges);
			return newRanges;
		}
	}
});
