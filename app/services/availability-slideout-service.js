import Ember from 'ember';
import Phone from 'textup-frontend/models/phone';

const { RSVP } = Ember;

export default Ember.Service.extend({
  store: Ember.inject.service(),

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
  },

  onAddAudio(phone, mimeType, data) {
    return new RSVP.Promise((resolve, reject) => {
      if (!(phone instanceof Phone) || !mimeType || !data) {
        reject();
      }
      phone.get('media').then(foundMedia => {
        const media = foundMedia || this.get('store').createRecord('media');
        media.addAudio(mimeType, data);
        phone.set('media', media);
        resolve();
      }, reject);
    });
  }
});
