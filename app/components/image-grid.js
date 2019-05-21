import { filterBy, alias } from '@ember/object/computed';
import Component from '@ember/component';
import { get, computed } from '@ember/object';
import { tryInvoke } from '@ember/utils';
import Constants from 'textup-frontend/constants';
import DisplaysImages from 'textup-frontend/mixins/component/displays-images';

export default Component.extend(DisplaysImages, {
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
  _images: filterBy('images', 'isImage', true),
  _numImagesLoaded: 0,
  _shouldReturnResults: computed('_images.[]', '_numImagesLoaded', function() {
    return this.get('_images.length') === this.get('_numImagesLoaded');
  }),
  _hasImages: alias('_images.length'),

  // Internal handlers
  // -----------------

  _onSuccess(imageIndex) {
    this._handleImageLoad(imageIndex, true);
  },
  _onFailure(imageIndex) {
    this._handleImageLoad(imageIndex, false);
  },

  _handleImageLoad(imageIndex, loadResult) {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
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
