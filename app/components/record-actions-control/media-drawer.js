import Ember from 'ember';
import MediaElement from 'textup-frontend/models/media-element';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { tryInvoke } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  constants: Ember.inject.service(),

  propTypes: {
    images: PropTypes.arrayOf(PropTypes.instanceOf(MediaElement)),
    onRemoveImage: PropTypes.func
  },

  // Internal handlers
  // -----------------

  _onRemoveImage() {
    tryInvoke(this, 'onRemoveImage', [...arguments]);
  }
});
