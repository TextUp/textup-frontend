import Service, { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { isArray } from '@ember/array';
import { typeOf, isNone } from '@ember/utils';
import RSVP from 'rsvp';
import Constants from 'textup-frontend/constants';

export default Service.extend({
  store: service(),

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
        media.removeElement(get(element, Constants.PROP_NAME.MEDIA_ID));
        resolve();
      }, reject);
    });
  },
});
