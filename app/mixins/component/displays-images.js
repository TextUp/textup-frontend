import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { MediaImage } from 'textup-frontend/objects/media-image';

export default Ember.Mixin.create(PropTypesMixin, {
  propTypes: {
    images: PropTypes.arrayOf(PropTypes.instanceOf(MediaImage)).isRequired,
    onLoadEnd: PropTypes.func,
    itemClass: PropTypes.string
  }
});
