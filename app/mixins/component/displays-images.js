import Mixin from '@ember/object/mixin';
import MediaElement from 'textup-frontend/models/media-element';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Mixin.create(PropTypesMixin, {
  propTypes: {
    images: PropTypes.oneOfType([
      PropTypes.null,
      PropTypes.arrayOf(PropTypes.instanceOf(MediaElement))
    ]),
    onLoadEnd: PropTypes.func,
    itemClass: PropTypes.string
  }
});
