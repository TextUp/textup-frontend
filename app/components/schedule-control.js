import callIfPresent from 'textup-frontend/utils/call-if-present';
import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import Schedule from 'textup-frontend/models/schedule';

const { computed } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    schedule: PropTypes.instanceOf(Schedule).isRequired,
    scheduleClass: PropTypes.string,
    onChange: PropTypes.func,
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
    this.setProperties({ _newRangeTimes: [] });
  },
  _handleAdd(dayOfWeek, timeRange, then) {
    Ember.tryInvoke(this, 'onChange', [
      dayOfWeek,
      [...this._copyDayOfWeekRanges(dayOfWeek), timeRange],
    ]);
    callIfPresent(this, then);
  },
  _handleUpdate(dayOfWeek, dataIndex, newRange) {
    const ranges = this._copyDayOfWeekRanges(dayOfWeek);
    ranges[dataIndex] = newRange;
    Ember.tryInvoke(this, 'onChange', [dayOfWeek, ranges]);
  },
  _handleRemove(dayOfWeek, dataIndex) {
    const ranges = this._copyDayOfWeekRanges(dayOfWeek);
    ranges.removeAt(dataIndex, 1);
    Ember.tryInvoke(this, 'onChange', [dayOfWeek, ranges]);
  },

  // Helpers
  // -------

  _copyDayOfWeekRanges(dayOfWeek) {
    const ranges = this.get(`schedule.${dayOfWeek}`);
    return ranges ? [...ranges] : [];
  },
});
