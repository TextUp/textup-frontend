import Constants from 'textup-frontend/constants';
import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import DS from 'ember-data';
import Ember from 'ember';
import MF from 'ember-data-model-fragments';
import { stringToIntervals, intervalsToString } from 'textup-frontend/utils/schedule';

const { defineProperty, computed, on } = Ember;

export default MF.Fragment.extend(Dirtiable, {
  // this is a read-only value that represents the integrated value
  // for whether or not this schedule is availability right now
  isAvailableNow: DS.attr('boolean'),

  manual: DS.attr('boolean', { defaultValue: true }),
  manualIsAvailable: DS.attr('boolean', { defaultValue: true }),

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
    Constants.DAYS_OF_WEEK.forEach(dayOfWeek => {
      const stringProp = `${dayOfWeek}String`;
      defineProperty(
        this,
        dayOfWeek,
        computed(stringProp, {
          get() {
            return stringToIntervals(this.get(stringProp));
          },
          set(key, intervals) {
            this.set(stringProp, intervalsToString(intervals));
            return intervals;
          },
        })
      );
    });
  }),
});
