import Ember from 'ember';
import DisplaysImages from 'textup-frontend/mixins/component/displays-images';
import { API_ID_PROP_NAME } from 'textup-frontend/objects/media-image';

const { computed, get, tryInvoke } = Ember;

export default Ember.Component.extend(DisplaysImages, {
  classNames: ['image-grid'],

  didUpdateAttrs() {
    this._super(...arguments);
    this.setProperties({ _numImagesLoaded: 0, _loadResults: Object.create(null) });
  },

  // Internal properties
  // -------------------

  _loadResults: computed(() => Object.create(null)),
  _numImagesLoaded: 0,
  _shouldReturnResults: computed('images.[]', '_numImagesLoaded', function() {
    return this.get('images.length') === this.get('_numImagesLoaded');
  }),

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
    if (imageIndex >= this.get('images.length')) {
      return;
    }
    const image = this.get('images').objectAt(imageIndex);
    return image ? get(image, API_ID_PROP_NAME) : null;
  }
});
