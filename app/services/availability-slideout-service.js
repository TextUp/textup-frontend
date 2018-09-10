import Ember from 'ember';

const { RSVP } = Ember;

export default Ember.Service.extend({
  onAvailabilityEntitySwitch(entity) {
    return new RSVP.Promise((resolve, reject) => {
      const isManualSchedule = entity.get('manualSchedule');
      if (isManualSchedule === false) {
        entity.get('schedule').then(sched1 => {
          if (!sched1) {
            entity.set('schedule', this.store.createRecord('schedule'));
          }
          resolve();
        }, reject);
      } else {
        resolve();
      }
    });
  }
});
