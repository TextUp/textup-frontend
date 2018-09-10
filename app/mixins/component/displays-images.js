import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { MediaImage } from 'textup-frontend/objects/media-image';

export default Ember.Mixin.create(PropTypesMixin, {
  propTypes: {
    images: PropTypes.oneOfType([
      PropTypes.null,
      PropTypes.arrayOf(PropTypes.instanceOf(MediaImage))
    ]),
    onLoadEnd: PropTypes.func,
    itemClass: PropTypes.string
  }
});
