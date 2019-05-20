import { tryInvoke } from '@ember/utils';
import Component from '@ember/component';
import { computed } from '@ember/object';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import moment from 'moment';

export default Component.extend(PropTypesMixin, {
  propTypes: {
    data: PropTypes.arrayOf(PropTypes.string), // Format: ["0230", "2301"]
    onChange: PropTypes.func,
    timeInterval: PropTypes.number
  },
  getDefaultProps() {
    return { data: [], timeInterval: 30 };
  },
  classNames: 'row',

  // Internal props
  // --------------

  _start: computed('data.[]', function() {
    return this._convertTimeStringToDate(this.get('data').objectAt(0));
  }),
  _end: computed('data.[]', function() {
    return this._convertTimeStringToDate(this.get('data').objectAt(1));
  }),

  // Handlers
  // --------

  _handleStartChange(newStart) {
    const endDate = this.get('_end'),
      newStartString = this._convertDateToTimeString(newStart);
    // if new start is later than a DEFINED end time, set the end time
    // to be the same as the start time so we don't have an invalid range
    if (endDate && newStart > endDate) {
      tryInvoke(this, 'onChange', [[newStartString, newStartString]]);
    } else {
      tryInvoke(this, 'onChange', [[newStartString, this.get('data').objectAt(1)]]);
    }
  },
  _handleEndChange(newEnd) {
    tryInvoke(this, 'onChange', [
      [this.get('data').objectAt(0), this._convertDateToTimeString(newEnd)]
    ]);
  },

  // Helpers
  // -------

  _convertTimeStringToDate(timeString) {
    return timeString ? moment(timeString, 'HHmm').toDate() : null;
  },
  _convertDateToTimeString(date) {
    return date ? moment(date).format('HHmm') : null;
  }
});
