import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import callIfPresent from '../utils/call-if-present';

const { computed } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    schedule: PropTypes.EmberObject.isRequired,
    scheduleClass: PropTypes.string,
    onChange: PropTypes.func
  },
  getDefaultProps() {
    return { scheduleClass: '' };
  },

  // Internal props
  // --------------

  _newRangeDay: null,
  _newRangeTimes: computed(() => []),

  // Handlers
  // --------

  _resetNewProps() {
    // don't clear day to insert to streamline inserting multiple ranges
    this.setProperties({
      _newRangeTimes: []
    });
  },
  _handleAdd(dayOfWeek, timeRange, then) {
    callIfPresent(this.get('onChange'), dayOfWeek, [
      ...this._copyDayOfWeekRanges(dayOfWeek),
      timeRange
    ]);
    callIfPresent(then);
  },
  _handleUpdate(dayOfWeek, dataIndex, newRange) {
    const ranges = this._copyDayOfWeekRanges(dayOfWeek);
    ranges[dataIndex] = newRange;
    callIfPresent(this.get('onChange'), dayOfWeek, ranges);
  },
  _handleRemove(dayOfWeek, dataIndex) {
    const ranges = this._copyDayOfWeekRanges(dayOfWeek);
    ranges.removeAt(dataIndex, 1);
    callIfPresent(this.get('onChange'), dayOfWeek, ranges);
  },

  // Helpers
  // -------

  _copyDayOfWeekRanges(dayOfWeek) {
    const ranges = this.get(`schedule.${dayOfWeek}`);
    return ranges ? [...ranges] : [];
  }
});
