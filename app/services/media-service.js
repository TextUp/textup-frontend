import Ember from 'ember';
import MediaElement from 'textup-frontend/models/media-element';
import { MEDIA_ID_PROP_NAME } from 'textup-frontend/models/media';

const { get, isArray, isNone, typeOf } = Ember;

export default Ember.Service.extend({
  store: Ember.inject.service(),

  addImage(mediaOwner, newImages) {
    if (typeOf(mediaOwner) !== 'instance' || !isArray(newImages)) {
      return;
    }
    get(mediaOwner, 'media').then(foundMedia => {
      const media = foundMedia || this.get('store').createRecord('media');
      newImages.forEach(imageObj => {
        const { mimeType, data, width, height } = imageObj;
        media.addImage(mimeType, data, width, height);
      });
      mediaOwner.set('media', media);
    });
  },
  addAudio(mediaOwner, mimeType, data) {
    if (typeOf(mediaOwner) !== 'instance' || !mimeType || !data) {
      return;
    }
    get(mediaOwner, 'media').then(foundMedia => {
      const media = foundMedia || this.get('store').createRecord('media');
      media.addAudio(mimeType, data);
      mediaOwner.set('media', media);
    });
  },
  removeMedia(mediaOwner, img) {
    if (typeOf(mediaOwner) !== 'instance' || !(img instanceof MediaElement)) {
      return;
    }
    get(mediaOwner, 'media').then(media => {
      if (isNone(media)) {
        return;
      }
      media.removeElement(get(img, MEDIA_ID_PROP_NAME));
    });
  }
});
