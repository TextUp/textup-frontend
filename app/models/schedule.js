import DS from 'ember-data';
import Ember from 'ember';
import { stringToIntervals, intervalsToString } from '../utils/schedule';

const { defineProperty, computed, on } = Ember;

export default DS.Model.extend({
  isAvailableNow: DS.attr('boolean'),
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
    this.get('constants.DAYS_OF_WEEK').forEach(dayOfWeek => {
      const stringProp = `${dayOfWeek}String`;
      defineProperty(
        this,
        dayOfWeek,
        computed(stringProp, {
          get: function() {
            return stringToIntervals(this.get(stringProp));
          },
          set: function(key, intervals) {
            this.set(stringProp, intervalsToString(intervals));
            return intervals;
          }
        })
      );
    });
  }),

  // Methods
  // -------

  actions: {
    replaceRange(dayOfWeek, newRanges) {
      if (!this.get('constants.DAYS_OF_WEEK').contains(dayOfWeek)) {
        return;
      }
      this.set(dayOfWeek, newRanges);
    }
  }
});
