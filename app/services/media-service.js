import Ember from 'ember';
import { MEDIA_ID_PROP_NAME } from 'textup-frontend/models/media';

const { get, isArray, isNone, typeOf, RSVP } = Ember;

export default Ember.Service.extend({
  store: Ember.inject.service(),

  addImage(mediaOwner, newImages) {
    if (typeOf(mediaOwner) !== 'instance' || !isArray(newImages)) {
      return;
    }
    return new RSVP.Promise((resolve, reject) => {
      get(mediaOwner, 'media').then(foundMedia => {
        const media = foundMedia || this.get('store').createRecord('media');
        newImages.forEach(imageObj => {
          const { mimeType, data, width, height } = imageObj;
          media.addImage(mimeType, data, width, height);
        });
        mediaOwner.set('media', media);
        resolve();
      }, reject);
    });
  },
  addAudio(mediaOwner, mimeType, data) {
    if (typeOf(mediaOwner) !== 'instance' || !mimeType || !data) {
      return;
    }
    return new RSVP.Promise((resolve, reject) => {
      get(mediaOwner, 'media').then(foundMedia => {
        const media = foundMedia || this.get('store').createRecord('media');
        media.addAudio(mimeType, data);
        mediaOwner.set('media', media);
        resolve();
      }, reject);
    });
  },
  removeMedia(mediaOwner, element) {
    if (typeOf(mediaOwner) !== 'instance' || typeOf(element) !== 'instance') {
      return;
    }
    return new RSVP.Promise((resolve, reject) => {
      get(mediaOwner, 'media').then(media => {
        if (isNone(media)) {
          return;
        }
        media.removeElement(get(element, MEDIA_ID_PROP_NAME));
        resolve();
      }, reject);
    });
  }
});
