import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import DisplaysImages from 'textup-frontend/mixins/component/displays-images';

const { computed, get, tryInvoke } = Ember;

export default Ember.Component.extend(DisplaysImages, {
  classNames: ['image-grid'],
  classNameBindings: ['_hasImages::image-grid--none'],

  didUpdateAttrs() {
    this._super(...arguments);
    this.setProperties({ _numImagesLoaded: 0, _loadResults: {} });
  },

  // Internal properties
  // -------------------

  _loadResults: computed(() => {
    return {};
  }),
  _images: computed.filterBy('images', 'isImage', true),
  _numImagesLoaded: 0,
  _shouldReturnResults: computed('_images.[]', '_numImagesLoaded', function() {
    return this.get('_images.length') === this.get('_numImagesLoaded');
  }),
  _hasImages: computed.alias('_images.length'),

  // Internal handlers
  // -----------------

  _onSuccess(imageIndex) {
    this._handleImageLoad(imageIndex, true);
  },
  _onFailure(imageIndex) {
    this._handleImageLoad(imageIndex, false);
  },

  _handleImageLoad(imageIndex, loadResult) {
    this.incrementProperty('_numImagesLoaded');
    this.get('_loadResults')[this._getImageIdFromIndex(imageIndex)] = loadResult;
    if (this.get('_shouldReturnResults')) {
      tryInvoke(this, 'onLoadEnd', [this.get('_loadResults')]);
    }
  },
  _getImageIdFromIndex(imageIndex) {
    if (imageIndex >= this.get('_images.length')) {
      return;
    }
    const image = this.get('_images').objectAt(imageIndex);
    return image ? get(image, Constants.PROP_NAME.MEDIA_ID) : null;
  },
});
