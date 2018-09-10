import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { MediaImage } from 'textup-frontend/objects/media-image';

const { tryInvoke } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  constants: Ember.inject.service(),

  propTypes: {
    images: PropTypes.arrayOf(PropTypes.instanceOf(MediaImage)),
    onRemoveImage: PropTypes.func
  },

  // Internal handlers
  // -----------------

  _onRemoveImage() {
    tryInvoke(this, 'onRemoveImage', [...arguments]);
  }
});
