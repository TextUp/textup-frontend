import Ember from 'ember';

const { computed, isPresent } = Ember;

export const API_ID_PROP_NAME = 'uid';

export const MediaImage = Ember.Object.extend({
  [API_ID_PROP_NAME]: null,
  mimeType: null,
  versions: computed.readOnly('_versions'),

  // Internal properties
  // -------------------

  _versions: computed(() => []),

  // Methods
  // -------

  addVersion(rawSource, rawWidth, rawHeight) {
    const source = isPresent(rawSource) ? `${rawSource}` : null,
      width = isNaN(parseInt(rawWidth)) ? null : parseInt(rawWidth),
      height = isNaN(parseInt(rawHeight)) ? null : parseInt(rawHeight);
    if (isPresent(source)) {
      this.get('_versions').pushObject(MediaImageVersion.create({ source, width, height }));
      return true;
    } else {
      return false;
    }
  }
});

export const MediaImageVersion = Ember.Object.extend({
  source: null, // either a url or a base64-encoded image
  width: null, // a number
  height: null // a number
});
