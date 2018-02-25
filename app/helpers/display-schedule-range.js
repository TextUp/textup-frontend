import Ember from 'ember';
import moment from 'moment';

export function displayScheduleRange([times, joinWord = ' to ']) {
  if (!Ember.isArray(times)) {
    return times;
  }
  return times.map(time => moment(time, 'HHmm').format('hh:mm A')).join(joinWord);
}

export default Ember.Helper.helper(displayScheduleRange);
