import { filterBy, alias } from '@ember/object/computed';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { tryInvoke } from '@ember/utils';
import Constants from 'textup-frontend/constants';
import DisplaysImages from 'textup-frontend/mixins/component/displays-images';

export default Component.extend(DisplaysImages, {
  classNames: ['image-stack'],
  classNameBindings: ['_hasMultiple:image-stack--multiple'],

  // Internal properties
  // -------------------

  _images: filterBy('images', 'isImage', true),
  _coverImage: alias('_images.firstObject'),
  _numImages: alias('_images.length'),
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
