import Ember from 'ember';
import DS from 'ember-data';
import { MediaImage, API_ID_PROP_NAME } from 'textup-frontend/objects/media-image';

const { typeOf, get } = Ember;

function isAnyObject(item) {
  return typeOf(item) === 'instance' || typeOf(item) === 'object';
}

export default DS.Transform.extend({
  // checking representation of a media element from the api
  deserialize(serialized) {
    if (typeOf(serialized) !== 'array') {
      return [];
    }
    const images = [];
    serialized.forEach(apiItem => {
      if (isAnyObject(apiItem)) {
        const mediaImage = MediaImage.create({
          [API_ID_PROP_NAME]: get(apiItem, API_ID_PROP_NAME),
          mimeType: get(apiItem, 'mimeType')
        });
        Object.keys(apiItem).forEach(key => {
          const version = get(apiItem, key);
          // if a prop is an object and has a link transform it
          if (isAnyObject(version) && get(version, 'link')) {
            const { link, width, height } = version;
            mediaImage.addVersion(link, width, height);
          }
        });
        images.pushObject(mediaImage);
      }
    });
    return images;
  },

  serialize(deserialized) {
    return deserialized;
  }
});
