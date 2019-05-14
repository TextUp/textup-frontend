import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import TypeUtils from 'textup-frontend/utils/type';

export default Ember.Service.extend({
  replaceRange(scheduleObj, dayOfWeek, newRanges) {
    if (!TypeUtils.isSchedule(scheduleObj) || !Constants.DAYS_OF_WEEK.includes(dayOfWeek)) {
      return;
    }
    scheduleObj.set(dayOfWeek, newRanges);
  },
});
