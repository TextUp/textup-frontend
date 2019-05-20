import { helper as buildHelper } from '@ember/component/helper';
import { isArray } from '@ember/array';
import moment from 'moment';

export function displayScheduleRange([times, joinWord = ' to ']) {
  if (!isArray(times)) {
    return times;
  }
  return times.map(time => moment(time, 'HHmm').format('hh:mm A')).join(joinWord);
}

export default buildHelper(displayScheduleRange);
