import Component from '@ember/component';
import Constants from 'textup-frontend/constants';
import DisplaysImages from 'textup-frontend/mixins/component/displays-images';
import { PropTypes } from 'ember-prop-types';
import { tryInvoke } from '@ember/utils';

export default Component.extend(DisplaysImages, {
  propTypes: Object.freeze({
    onAdd: PropTypes.func,
    onRemove: PropTypes.func,
    imageDisplayComponent: PropTypes.oneOf(Object.values(Constants.PHOTO_CONTROL.DISPLAY)),
    addComponentClass: PropTypes.string,
    readOnly: PropTypes.bool,
  }),
  getDefaultProps() {
    return {
      images: [],
      addComponentClass: '',
      imageDisplayComponent: Constants.PHOTO_CONTROL.DISPLAY.STACK,
      readOnly: false,
    };
  },

  classNames: ['photo-control'],

  // Internal handlers
  // -----------------

  _doRemove(image, index, event) {
    // so that the gallery is not opened
    event.stopPropagation();
    tryInvoke(this, 'onRemove', [...arguments]);
  },
});
