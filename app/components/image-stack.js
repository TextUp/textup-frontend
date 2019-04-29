import Constants from 'textup-frontend/constants';
import DisplaysImages from 'textup-frontend/mixins/component/displays-images';
import Ember from 'ember';

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
    tryInvoke(this, 'onLoadEnd', [
      { [this.get(`_coverImage.${Constants.PROP_NAME.MEDIA_ID}`)]: true },
    ]);
  },
  _onFailure() {
    tryInvoke(this, 'onLoadEnd', [
      { [this.get(`_coverImage.${Constants.PROP_NAME.MEDIA_ID}`)]: false },
    ]);
  },
});
