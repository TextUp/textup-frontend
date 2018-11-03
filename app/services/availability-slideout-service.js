import Ember from 'ember';

const { RSVP, typeOf } = Ember;

export default Ember.Service.extend({
  dataService: Ember.inject.service(),
  store: Ember.inject.service(),

  // scheduleOwner is either a staff or availability model
  ensureScheduleIsPresent(scheduleOwner) {
    return new RSVP.Promise((resolve, reject) => {
      if (typeOf(scheduleOwner) !== 'instance') {
        return reject('Must pass an Ember object into `ensureScheduleIsPresent`');
      }
      const isManualSchedule = scheduleOwner.get('manualSchedule');
      if (isManualSchedule === false) {
        scheduleOwner.get('schedule').then(sched1 => {
          if (!sched1) {
            scheduleOwner.set('schedule', this.get('store').createRecord('schedule'));
          }
          resolve();
        }, reject);
      } else {
        resolve();
      }
    });
  },

  startRedoVoicemailGreeting(phone) {
    if (typeOf(phone) !== 'instance') {
      return;
    }
    const media = phone.get('media.content');
    if (media) {
      media.rollbackAttributes();
    }
    phone.set('shouldRedoVoicemailGreeting', true);
  },
  cancelRedoVoicemailGreeting(phone) {
    if (typeOf(phone) !== 'instance') {
      return;
    }
    phone.set('shouldRedoVoicemailGreeting', false);
  },
  onAddAudio(phone, mimeType, data) {
    return new RSVP.Promise((resolve, reject) => {
      if (typeOf(phone) !== 'instance' || !mimeType || !data) {
        reject('Must provide all required information to add audio');
      }
      phone.get('media').then(foundMedia => {
        const media = foundMedia || this.get('store').createRecord('media');
        media.addAudio(mimeType, data);
        phone.setProperties({ media, shouldRedoVoicemailGreeting: false });
        resolve();
      }, reject);
    });
  },
  onRequestVoicemailGreetingCall(phoneOwner, numToCall) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      if (typeOf(phoneOwner) !== 'instance' || !numToCall) {
        return reject('Must provide all required information to request voicemail greeting call');
      }
      const phone = phoneOwner.get('phone.content');
      if (typeOf(phone) !== 'instance') {
        return reject('Must have a phone to request voicemail greeting call');
      }
      phone.set('requestVoicemailGreetingCall', numToCall);
      this.get('dataService')
        .persist(phoneOwner)
        .then(resolve, reject);
    });
  }
});
