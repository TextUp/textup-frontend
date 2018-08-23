import Ember from 'ember';
import { PropTypes } from 'ember-prop-types';
import DisplaysImages from 'textup-frontend/mixins/component/displays-images';

const { tryInvoke } = Ember;

export default Ember.Component.extend(DisplaysImages, {
  constants: Ember.inject.service(),

  propTypes: {
    onAdd: PropTypes.func,
    onRemove: PropTypes.func,
    imageDisplayComponent: PropTypes.string,
    readOnly: PropTypes.bool
  },
  getDefaultProps() {
    return {
      images: [],
      imageDisplayComponent: this.get('constants.PHOTO_CONTROL.DISPLAY.STACK'),
      readOnly: false
    };
  },

  classNames: ['photo-control'],

  // Internal handlers
  // -----------------

  _doRemove() {
    tryInvoke(this, 'onRemove', [...arguments]);
  }
});
