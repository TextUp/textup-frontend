import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import DS from 'ember-data';
import Ember from 'ember';

const { computed } = Ember;

export default DS.Model.extend(Dirtiable, {
  rollbackAttributes: function() {
    this._super(...arguments);
    this.get('schedule').then(s1 => s1 && s1.rollbackAttributes());
  },

  // Attributes
  // ----------

  name: DS.attr('string'),
  useStaffAvailability: DS.attr('boolean'),
  manualSchedule: DS.attr('boolean'),
  isAvailable: DS.attr('boolean'),
  // this is a read-only value that represents the integrated value
  // for whether or not the staff member is availability right now
  isAvailableNow: DS.attr('boolean'),
  schedule: DS.belongsTo('schedule'),

  // Computed properties
  // -------------------

  hasManualChanges: computed.alias('schedule.isDirty')
});
