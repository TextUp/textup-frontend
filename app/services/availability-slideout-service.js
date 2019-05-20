import Service, { inject as service } from '@ember/service';
import RSVP, { Promise } from 'rsvp';
import { typeOf } from '@ember/utils';

export default Service.extend({
  dataService: service(),
  store: service(),

  onAddAudio(phone, mimeType, data) {
    return new RSVP.Promise((resolve, reject) => {
      if (typeOf(phone) !== 'instance' || !mimeType || !data) {
        reject('Must provide all required information to add audio');
      }
      phone.get('media').then(foundMedia => {
        // so we're not also sending all of the prior attempts too
        if (foundMedia) {
          foundMedia.rollbackAttributes();
        }
        const media = foundMedia || this.get('store').createRecord('media');
        media.addAudio(mimeType, data);
        phone.setProperties({ media });
        resolve();
      }, reject);
    });
  },
  onRequestVoicemailGreetingCall(phoneOwner, numToCall) {
    return new Promise((resolve, reject) => {
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
  },
});
