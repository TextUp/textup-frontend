import Ember from 'ember';
import md5 from 'npm:blueimp-md5';
import { MediaImage, API_ID_PROP_NAME } from 'textup-frontend/objects/media-image';

export const ACTIONS_ID_PROP_NAME = 'key';

export const AddChange = Ember.Object.extend({
  [ACTIONS_ID_PROP_NAME]: null,
  mimeType: null,
  data: null,
  width: null,
  height: null,

  // Methods
  // -------

  toMediaImage() {
    const img = MediaImage.create({
      [API_ID_PROP_NAME]: this.get(ACTIONS_ID_PROP_NAME),
      mimeType: this.get('mimeType')
    });
    img.addVersion(this.get('data'), this.get('width'), this.get('height'));
    return img;
  },
  toAction(constants) {
    const data = this.get('data');
    return {
      action: constants.ACTION.MEDIA.ADD,
      mimeType: this.get('mimeType'),
      data: data,
      checksum: md5(data)
    };
  }
});

export const RemoveChange = Ember.Object.extend({
  [ACTIONS_ID_PROP_NAME]: null,

  // Methods
  // -------

  toAction(constants) {
    return {
      action: constants.ACTION.MEDIA.REMOVE,
      [ACTIONS_ID_PROP_NAME]: this.get(ACTIONS_ID_PROP_NAME)
    };
  }
});
