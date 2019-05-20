import Component from '@ember/component';
import { tryInvoke } from '@ember/utils';
import Constants from 'textup-frontend/constants';
import DisplaysImages from 'textup-frontend/mixins/component/displays-images';
import { PropTypes } from 'ember-prop-types';

export default Component.extend(DisplaysImages, {
  propTypes: {
    onAdd: PropTypes.func,
    onRemove: PropTypes.func,
    imageDisplayComponent: PropTypes.oneOf(Object.values(Constants.PHOTO_CONTROL.DISPLAY)),
    addComponentClass: PropTypes.string,
    readOnly: PropTypes.bool,
  },
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
