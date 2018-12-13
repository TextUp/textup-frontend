import DisplaysImages from 'textup-frontend/mixins/component/displays-images';
import Ember from 'ember';
import { MEDIA_ID_PROP_NAME } from 'textup-frontend/models/media';

const { computed, tryInvoke } = Ember;

export default Ember.Component.extend(DisplaysImages, {
  classNames: ['image-stack'],
  classNameBindings: ['_hasMultiple:image-stack--multiple'],

  // Internal properties
  // -------------------

  _images: computed.filterBy('images', 'isImage', true),
  _coverImage: computed.alias('_images.firstObject'),
  _numImages: computed.alias('_images.length'),
  _hasMultiple: computed('_images.[]', function() {
    return this.get('_images.length') > 1;
  }),

  // Internal handlers
  // -----------------

  _onSuccess() {
    tryInvoke(this, 'onLoadEnd', [{ [this.get(`_coverImage.${MEDIA_ID_PROP_NAME}`)]: true }]);
  },
  _onFailure() {
    tryInvoke(this, 'onLoadEnd', [{ [this.get(`_coverImage.${MEDIA_ID_PROP_NAME}`)]: false }]);
  }
});
